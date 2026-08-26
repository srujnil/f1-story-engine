import "server-only";

import type {
  DriverStanding,
  DriverForm,
  PodiumFinisher,
  Race,
  SeasonData,
  TeamStanding,
} from "@/types";

const DEFAULT_API_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const PAGE_SIZE = 100;
const REVALIDATE_SECONDS = 60 * 60;
const USER_AGENT = "F1StoryEngine/0.1.0";

type ApiDriver = {
  driverId: string;
  givenName: string;
  familyName: string;
};

type ApiConstructor = {
  name: string;
};

type ApiResult = {
  position: string;
  grid?: string;
  Driver: ApiDriver;
  Constructor?: ApiConstructor;
  FastestLap?: { rank?: string };
};

type ApiRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitName: string;
    Location: { country: string };
  };
  Results?: ApiResult[];
};

type RaceResponse = {
  MRData: {
    total: string;
    RaceTable: { Races: ApiRace[] };
  };
};

type StandingsResponse = {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: Array<{
          position: string;
          points: string;
          wins: string;
          Driver: ApiDriver;
          Constructors: ApiConstructor[];
        }>;
      }>;
    };
  };
};

type ConstructorStandingsResponse = {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        ConstructorStandings: Array<{
          position: string;
          points: string;
          wins: string;
          Constructor: ApiConstructor;
        }>;
      }>;
    };
  };
};

function apiBaseUrl(): string {
  return (process.env.F1_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(
    /\/$/,
    "",
  );
}

async function fetchRacePage(path: string): Promise<RaceResponse> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Jolpica request failed with status ${response.status}`);
  }

  return (await response.json()) as RaceResponse;
}

async function fetchStandings(year: number): Promise<DriverStanding[]> {
  const response = await fetch(
    `${apiBaseUrl()}/${year}/driverstandings/?limit=30`,
    {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Jolpica standings request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as StandingsResponse;
  const standings =
    payload.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return standings.map((standing) => ({
    position: Number(standing.position),
    driver: driverName(standing.Driver),
    team: standing.Constructors.at(-1)?.name ?? "Team unavailable",
    points: Number(standing.points),
    wins: Number(standing.wins),
  }));
}

async function fetchTeamStandings(year: number): Promise<TeamStanding[]> {
  const response = await fetch(
    `${apiBaseUrl()}/${year}/constructorstandings/?limit=30`,
    {
      headers: { "User-Agent": USER_AGENT },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Jolpica constructor standings request failed with status ${response.status}`,
    );
  }

  const payload = (await response.json()) as ConstructorStandingsResponse;
  const standings =
    payload.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

  return standings.map((standing) => ({
    position: Number(standing.position),
    team: standing.Constructor.name,
    points: Number(standing.points),
    wins: Number(standing.wins),
  }));
}

function driverName(driver: ApiDriver): string {
  return `${driver.givenName} ${driver.familyName}`;
}

async function fetchAllResults(year: number): Promise<ApiRace[]> {
  const firstPage = await fetchRacePage(
    `/${year}/results/?limit=${PAGE_SIZE}&offset=0`,
  );
  const total = Number(firstPage.MRData.total);
  const remainingOffsets: number[] = [];

  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    remainingOffsets.push(offset);
  }

  const remainingPages = await Promise.all(
    remainingOffsets.map((offset) =>
      fetchRacePage(`/${year}/results/?limit=${PAGE_SIZE}&offset=${offset}`),
    ),
  );
  const allRaces = [
    ...firstPage.MRData.RaceTable.Races,
    ...remainingPages.flatMap((page) => page.MRData.RaceTable.Races),
  ];

  // Pagination counts driver results, so a race can be split across pages.
  // Merge by round before adapting or we could silently lose half a grid.
  const byRound = new Map<number, ApiRace>();
  for (const race of allRaces) {
    const round = Number(race.round);
    const existing = byRound.get(round);
    if (!existing) {
      byRound.set(round, { ...race, Results: [...(race.Results ?? [])] });
      continue;
    }
    existing.Results = [...(existing.Results ?? []), ...(race.Results ?? [])];
  }

  return [...byRound.values()].sort(
    (left, right) => Number(left.round) - Number(right.round),
  );
}

function buildDriverForm(completedRaces: ApiRace[]): DriverForm[] {
  const formWindow = completedRaces.slice(-6);
  if (formWindow.length < 6) return [];

  const drivers = new Map<
    string,
    { driver: string; team: string; positions: Map<number, number> }
  >();

  for (const race of formWindow) {
    for (const result of race.Results ?? []) {
      const entry = drivers.get(result.Driver.driverId) ?? {
        driver: driverName(result.Driver),
        team: result.Constructor?.name ?? "Team unavailable",
        positions: new Map<number, number>(),
      };
      entry.team = result.Constructor?.name ?? entry.team;
      entry.positions.set(Number(race.round), Number(result.position));
      drivers.set(result.Driver.driverId, entry);
    }
  }

  const rounds = formWindow.map((race) => Number(race.round));
  return [...drivers.values()]
    .filter((entry) => rounds.every((round) => entry.positions.has(round)))
    .map((entry) => ({
      driver: entry.driver,
      team: entry.team,
      last6Positions: rounds.map((round) => entry.positions.get(round)!),
    }));
}

function adaptRace(scheduleRace: ApiRace, resultRace?: ApiRace): Race {
  const results = resultRace?.Results ?? [];
  const podium = results
    .filter((result) => [1, 2, 3].includes(Number(result.position)))
    .map((result) => ({
      position: Number(result.position) as PodiumFinisher["position"],
      driver: driverName(result.Driver),
      team: result.Constructor?.name ?? "Team unavailable",
    }))
    .sort((left, right) => left.position - right.position);
  const pole = results.find((result) => result.grid === "1");
  const fastest = results.find((result) => result.FastestLap?.rank === "1");

  return {
    season: Number(scheduleRace.season),
    round: Number(scheduleRace.round),
    name: scheduleRace.raceName,
    circuit: scheduleRace.Circuit.circuitName,
    country: scheduleRace.Circuit.Location.country,
    date: scheduleRace.date,
    startTime: scheduleRace.time
      ? `${scheduleRace.date}T${scheduleRace.time}`
      : null,
    status: results.length > 0 ? "completed" : "upcoming",
    podium,
    poleSitter: pole ? driverName(pole.Driver) : null,
    fastestLap: fastest ? driverName(fastest.Driver) : null,
  };
}

export async function getSeasonData(year: number): Promise<SeasonData> {
  const [scheduleResponse, completedRaces] = await Promise.all([
    fetchRacePage(`/${year}/races/?limit=${PAGE_SIZE}`),
    fetchAllResults(year),
  ]);
  const resultsByRound = new Map(
    completedRaces.map((race) => [Number(race.round), race]),
  );
  const schedule = scheduleResponse.MRData.RaceTable.Races;
  const [standings, teamStandings] = await Promise.all([
    fetchStandings(year),
    fetchTeamStandings(year),
  ]);

  if (schedule.length === 0) {
    throw new Error(`Jolpica returned no races for the ${year} season`);
  }

  return {
    races: schedule.map((race) =>
      adaptRace(race, resultsByRound.get(Number(race.round))),
    ),
    driverForm: buildDriverForm(completedRaces),
    standings,
    teamStandings,
  };
}
