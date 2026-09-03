import "server-only";

import { unstable_cache } from "next/cache";
import type {
  Race,
  RaceStory,
  RaceStoryMoment,
  RaceStoryMomentType,
  RaceStrategy,
} from "@/types";

const DEFAULT_API_BASE_URL = "https://api.openf1.org/v1";
const REVALIDATE_SECONDS = 60 * 60;
const USER_AGENT = "F1StoryEngine/0.1.0";
const MIN_REQUEST_INTERVAL_MS = 360;

let requestQueue: Promise<void> = Promise.resolve();
let lastRequestStartedAt = 0;

export class OpenF1RequestError extends Error {
  constructor(public readonly status: number) {
    super(`OpenF1 request failed with status ${status}`);
    this.name = "OpenF1RequestError";
  }
}

export function isOpenF1RateLimitError(
  error: unknown,
): error is OpenF1RequestError {
  return error instanceof OpenF1RequestError && error.status === 429;
}

type OpenF1Meeting = {
  meeting_key: number;
  meeting_name: string;
  country_name: string;
  date_end: string;
  is_cancelled: boolean;
};

type OpenF1Session = {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
};

type OpenF1RaceControl = {
  date: string;
  lap_number: number | null;
  category: string;
  message: string;
};

type OpenF1Pit = {
  driver_number: number;
  lap_number: number;
  lane_duration: number | null;
};

type OpenF1Stint = {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string | null;
};

type OpenF1Driver = {
  driver_number: number;
  first_name: string;
  last_name: string;
  full_name: string;
};

type OpenF1SessionResult = {
  position: number | null;
  driver_number: number;
  number_of_laps: number;
  gap_to_leader: number | string | null;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
};

function apiBaseUrl(): string {
  // Same footgun as lib/jolpica.ts — Vercel can set this to "" rather than
  // leaving it unset, and `??` doesn't fall back on an empty string.
  return (process.env.OPENF1_API_BASE_URL || DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForRequestSlot(): Promise<void> {
  const turn = requestQueue.then(async () => {
    const wait = Math.max(
      0,
      MIN_REQUEST_INTERVAL_MS - (Date.now() - lastRequestStartedAt),
    );
    if (wait > 0) await delay(wait);
    lastRequestStartedAt = Date.now();
  });
  requestQueue = turn.catch(() => undefined);
  await turn;
}

// The rate limiter below (waitForRequestSlot) only protects real network
// calls to OpenF1 — it must never run on a cache hit, or every cached read
// pays the same 360ms-per-call queueing cost as a live fetch. A page like
// /updates fans out to ~35 fetchOpenF1 calls (5 races x 7 endpoints); at
// 360ms/call that's 12s+ even when every one of them is already cached.
// unstable_cache solves this precisely: on a hit, fetchOpenF1Raw never runs,
// so waitForRequestSlot() never runs either. Plain `fetch()` + `next.revalidate`
// can't give us that — Next's default fetchCache also stops honoring it for
// fetches that run after a Request-time API (NavBar reads cookies() on every
// page), which unstable_cache isn't subject to.
async function fetchOpenF1Raw(path: string): Promise<unknown> {
  const request = () =>
    fetch(`${apiBaseUrl()}${path}`, {
      headers: { "User-Agent": USER_AGENT },
    });

  await waitForRequestSlot();
  let response = await request();
  if (response.status === 429) {
    await delay(1100);
    await waitForRequestSlot();
    response = await request();
  }

  if (!response.ok) {
    throw new OpenF1RequestError(response.status);
  }

  return response.json();
}

const fetchOpenF1Cached = unstable_cache(fetchOpenF1Raw, ["openf1"], {
  revalidate: REVALIDATE_SECONDS,
});

async function fetchOpenF1<T>(path: string): Promise<T[]> {
  const payload = await fetchOpenF1Cached(path);
  if (!Array.isArray(payload)) {
    throw new Error("OpenF1 returned an unexpected payload");
  }

  return payload as T[];
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/grand prix/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function driverName(driver: OpenF1Driver | undefined): string {
  if (!driver) return "Unknown driver";
  return `${driver.first_name} ${driver.last_name}`.trim();
}

function penaltyRecipient(message: string): number | null {
  const match = message.match(/PENALTY FOR CAR\s+(\d+)/);
  return match ? Number(match[1]) : null;
}

function penaltyReason(message: string): string | null {
  const reason = message.split(" - ").at(-1);
  if (!reason || reason === message) return null;
  return reason.replace(/\s*\([^)]*\)\s*$/, "").toLowerCase();
}

function momentFromMessage(
  item: OpenF1RaceControl,
  drivers: Map<number, OpenF1Driver>,
  index: number,
): (RaceStoryMoment & { priority: number }) | null {
  const lap = item.lap_number;
  if (!lap) return null;
  const message = item.message.toUpperCase();
  let type: RaceStoryMomentType;
  let headline: string;
  let detail: string;
  let priority: number;

  if (message.includes("RED FLAG - RACE SUSPENDED")) {
    type = "red-flag";
    headline = "Red flag suspends the race";
    detail = "Race Control suspended the race under a red flag.";
    priority = 100;
  } else if (message === "VSC DEPLOYED") {
    type = "safety-car";
    headline = "Virtual Safety Car deployed";
    detail =
      "Race Control neutralised the field under Virtual Safety Car conditions.";
    priority = 90;
  } else if (message.includes("SAFETY CAR DEPLOYED")) {
    type = "safety-car";
    headline = "Safety Car deployed";
    detail = "Race Control neutralised the field behind the Safety Car.";
    priority = 95;
  } else if (
    message.includes("PENALTY FOR CAR") &&
    message.includes("CAUSING A COLLISION")
  ) {
    const recipient = driverName(drivers.get(penaltyRecipient(message) ?? -1));
    type = "collision";
    headline = `${recipient} penalised after collision`;
    detail = "Race Control issued a penalty for causing a collision.";
    priority = 85;
  } else if (
    message.includes("PENALTY FOR CAR") &&
    !message.includes("PENALTY SERVED")
  ) {
    const recipient = driverName(drivers.get(penaltyRecipient(message) ?? -1));
    const isDriveThrough = message.includes("DRIVE THROUGH");
    const reason = penaltyReason(message);
    type = "penalty";
    headline = isDriveThrough
      ? `${recipient} receives a drive-through`
      : `${recipient} receives a time penalty`;
    detail = `${isDriveThrough ? "A drive-through" : "A time"} penalty was issued${reason ? ` for ${reason}` : ""}.`;
    priority = isDriveThrough ? 65 : 55;
  } else {
    return null;
  }

  return {
    id: `${lap}-${type}-${index}`,
    lap,
    type,
    headline,
    detail,
    provenance: "Race Control",
    priority,
  };
}

function buildMoments(
  raceControl: OpenF1RaceControl[],
  sessionStart: string,
  drivers: Map<number, OpenF1Driver>,
): RaceStoryMoment[] {
  const candidates = raceControl
    .filter((item) => item.date >= sessionStart)
    .map((item, index) => momentFromMessage(item, drivers, index))
    .filter(
      (item): item is RaceStoryMoment & { priority: number } => item !== null,
    );

  const deduplicated = new Map<
    string,
    RaceStoryMoment & { priority: number }
  >();
  for (const item of candidates) {
    const key =
      item.type === "collision"
        ? `${item.type}-${item.headline}`
        : `${item.lap}-${item.type}-${item.headline}`;
    if (!deduplicated.has(key)) deduplicated.set(key, item);
  }

  return [...deduplicated.values()]
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 6)
    .sort((left, right) => left.lap - right.lap)
    .map((item) => ({
      id: item.id,
      lap: item.lap,
      type: item.type,
      headline: item.headline,
      detail: item.detail,
      provenance: item.provenance,
    }));
}

function findDriverNumber(
  name: string,
  drivers: OpenF1Driver[],
): number | null {
  const normalizedName = normalize(name);
  const match = drivers.find(
    (driver) =>
      normalizedName === normalize(driverName(driver)) ||
      normalizedName.endsWith(normalize(driver.last_name)),
  );
  return match?.driver_number ?? null;
}

function buildStrategies(
  race: Race,
  drivers: OpenF1Driver[],
  stints: OpenF1Stint[],
  pits: OpenF1Pit[],
): RaceStrategy[] {
  return race.podium.flatMap((finisher) => {
    const number = findDriverNumber(finisher.driver, drivers);
    if (number === null) return [];

    const driverStints = stints
      .filter((stint) => stint.driver_number === number)
      .sort((left, right) => left.stint_number - right.stint_number)
      .map((stint) => ({
        compound: stint.compound ?? "UNKNOWN",
        lapStart: stint.lap_start,
        lapEnd: stint.lap_end,
      }));
    const pitLaps = pits
      .filter(
        (pit) =>
          pit.driver_number === number &&
          pit.lap_number > 2 &&
          (pit.lane_duration === null || pit.lane_duration < 120),
      )
      .map((pit) => pit.lap_number)
      .sort((left, right) => left - right);

    return [
      {
        driver: finisher.driver,
        team: finisher.team,
        finishPosition: finisher.position,
        stints: driverStints,
        pitLaps,
      },
    ];
  });
}

export async function getRaceStory(race: Race): Promise<RaceStory | null> {
  if (race.status !== "completed") return null;

  const meetings = await fetchOpenF1<OpenF1Meeting>(
    `/meetings?year=${race.season}`,
  );
  const meeting = meetings.find(
    (item) =>
      !item.is_cancelled &&
      (normalize(item.meeting_name) === normalize(race.name) ||
        (normalize(item.country_name) === normalize(race.country) &&
          item.date_end.slice(0, 10) === race.date)),
  );
  if (!meeting) return null;

  const sessions = await fetchOpenF1<OpenF1Session>(
    `/sessions?meeting_key=${meeting.meeting_key}`,
  );
  const session = sessions.find(
    (item) => item.session_name === "Race" && item.session_type === "Race",
  );
  if (!session) return null;

  const [raceControl, pits, stints, drivers, results] = await Promise.all([
    fetchOpenF1<OpenF1RaceControl>(
      `/race_control?session_key=${session.session_key}`,
    ),
    fetchOpenF1<OpenF1Pit>(`/pit?session_key=${session.session_key}`),
    fetchOpenF1<OpenF1Stint>(`/stints?session_key=${session.session_key}`),
    fetchOpenF1<OpenF1Driver>(`/drivers?session_key=${session.session_key}`),
    fetchOpenF1<OpenF1SessionResult>(
      `/session_result?session_key=${session.session_key}`,
    ),
  ]);
  if (!results.length) return null;

  const driverMap = new Map(
    drivers.map((driver) => [driver.driver_number, driver]),
  );
  const moments = buildMoments(raceControl, session.date_start, driverMap);
  const retirements = results.filter(
    (result) => result.dnf || result.dns || result.dsq,
  ).length;
  const secondPlace = results.find((result) => result.position === 2);
  const winnerGapSeconds =
    typeof secondPlace?.gap_to_leader === "number"
      ? secondPlace.gap_to_leader
      : null;

  return {
    round: race.round,
    raceName: race.name,
    sessionKey: session.session_key,
    totalLaps: Math.max(...results.map((result) => result.number_of_laps)),
    classifiedFinishers: results.filter((result) => result.position !== null)
      .length,
    retirements,
    winnerGapSeconds,
    disruptions: moments.filter(
      (moment) => moment.type === "red-flag" || moment.type === "safety-car",
    ).length,
    moments,
    strategies: buildStrategies(race, drivers, stints, pits),
  };
}
