import Link from "next/link";
import {
  CircleAlert,
  FlagTriangleRight,
  Gauge,
  MessageCircle,
  ShieldAlert,
  TimerReset,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { teamColor } from "@/lib/team-colors";
import type { RaceStory, RaceStoryMomentType } from "@/types";

const momentStyles: Record<
  RaceStoryMomentType,
  { label: string; className: string; dotClassName: string }
> = {
  "red-flag": {
    label: "Red flag",
    className: "border-[#ef9aa4] bg-[#fff1f4] text-[#a9273e]",
    dotClassName: "bg-[#ff4057]",
  },
  "safety-car": {
    label: "Neutralisation",
    className: "border-[#ecd680] bg-[#fff9df] text-[#8a6200]",
    dotClassName: "bg-[#e5ac00]",
  },
  penalty: {
    label: "Penalty",
    className: "border-[#cdb9ee] bg-[#f7f1ff] text-[#7449b8]",
    dotClassName: "bg-violet",
  },
  collision: {
    label: "Incident",
    className: "border-[#9fd8f5] bg-[#eef9ff] text-[#1479ad]",
    dotClassName: "bg-electric",
  },
};

const compoundColors: Record<string, string> = {
  SOFT: "#ff4057",
  MEDIUM: "#e7b416",
  HARD: "#d8dde5",
  INTERMEDIATE: "#34b27b",
  WET: "#368bd6",
  UNKNOWN: "#aeb4bf",
};

function StrategyRow({
  strategy,
}: {
  strategy: RaceStory["strategies"][number];
}) {
  return (
    <li className="rounded-2xl border border-black/[0.08] bg-[#f8f9fb] p-4">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-white font-heading text-sm font-black shadow-sm">
          P{strategy.finishPosition}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-black">{strategy.driver}</p>
          <div className="flex items-center gap-1.5 text-xs text-black/50">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: teamColor(strategy.team) }}
            />
            {strategy.team}
          </div>
        </div>
        <span className="text-xs font-bold text-black/45">
          {strategy.pitLaps.length}{" "}
          {strategy.pitLaps.length === 1 ? "stop" : "stops"}
        </span>
      </div>

      <div className="flex h-7 overflow-hidden rounded-lg border border-black/10 bg-white">
        {strategy.stints.map((stint, index) => {
          const length = Math.max(1, stint.lapEnd - stint.lapStart + 1);
          return (
            <div
              key={`${stint.compound}-${stint.lapStart}-${index}`}
              title={`${stint.compound}: laps ${stint.lapStart}–${stint.lapEnd}`}
              aria-label={`${stint.compound} tyres, laps ${stint.lapStart} to ${stint.lapEnd}`}
              className="grid min-w-5 place-items-center border-r border-white/70 text-[9px] font-black text-[#24242d] last:border-r-0"
              style={{
                flexGrow: length,
                backgroundColor: compoundColors[stint.compound] ?? "#d8dde5",
              }}
            >
              {stint.compound.slice(0, 1)}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-black/45">
        <span>Pit laps: {strategy.pitLaps.join(", ") || "none recorded"}</span>
        <span>{strategy.stints.length} tyre stints</span>
      </div>
    </li>
  );
}

export function RaceStoryPanel({
  story,
  isLatest,
}: {
  story: RaceStory;
  isLatest: boolean;
}) {
  const stats = [
    { label: "Race distance", value: `${story.totalLaps} laps`, icon: Gauge },
    {
      label: "Disruptions",
      value: String(story.disruptions),
      icon: ShieldAlert,
    },
    {
      label: "Retirements",
      value: String(story.retirements),
      icon: CircleAlert,
    },
    {
      label: "Winning margin",
      value:
        story.winnerGapSeconds === null
          ? "Unavailable"
          : `${story.winnerGapSeconds.toFixed(1)}s`,
      icon: TimerReset,
    },
  ];

  return (
    <div
      aria-labelledby="race-story-heading"
      className="rounded-[2rem] border border-electric/20 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5 border-b border-black/[0.08] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge className="border border-electric/20 bg-electric/10 text-[#1479ad]">
              {isLatest ? "Latest race story" : "Archived race story"}
            </Badge>
            <Badge
              variant="outline"
              className="border-black/10 bg-[#f7f8fb] text-black/55"
            >
              Post-race data
            </Badge>
          </div>
          <h2
            id="race-story-heading"
            className="font-heading text-3xl font-black tracking-tight sm:text-4xl"
          >
            {story.raceName}: where it changed
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Pivotal Race Control events and podium tyre choices, refreshed
            hourly after the session.
          </p>
        </div>
        <a
          href="https://openf1.org/"
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-[#1479ad] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          Data from OpenF1 ↗
        </a>
      </div>

      <dl className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-black/[0.08] bg-[#f8f9fb] p-4"
          >
            <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-black/45">
              <Icon aria-hidden="true" className="size-4 text-electric" />{" "}
              {label}
            </dt>
            <dd className="mt-2 font-heading text-2xl font-black">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,.9fr)]">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <FlagTriangleRight
              aria-hidden="true"
              className="size-5 text-primary"
            />
            <h3 className="font-heading text-2xl font-black">
              Pivotal moments
            </h3>
          </div>
          {story.moments.length ? (
            <ol className="relative ml-3 border-l border-black/10 pl-6">
              {story.moments.map((moment) => {
                const style = momentStyles[moment.type];
                return (
                  <li key={moment.id} className="relative pb-6 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[1.73rem] top-1 size-3 rounded-full ring-4 ring-white ${style.dotClassName}`}
                    />
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-black/40">
                        LAP {moment.lap}
                      </span>
                      <Badge variant="outline" className={style.className}>
                        {style.label}
                      </Badge>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-black/35">
                        {moment.provenance}
                      </span>
                    </div>
                    <p className="font-heading text-lg font-black">
                      {moment.headline}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-black/55">
                      {moment.detail}
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="rounded-2xl bg-[#f8f9fb] p-4 text-sm text-muted-foreground">
              No pivotal Race Control events were available for this session.
            </p>
          )}
        </div>

        <div>
          <div className="mb-4">
            <h3 className="font-heading text-2xl font-black">
              Podium strategy board
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Recorded compounds and pit laps—not a judgement on strategy
              quality.
            </p>
          </div>
          <ol className="space-y-3">
            {story.strategies.map((strategy) => (
              <StrategyRow key={strategy.driver} strategy={strategy} />
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-black/45">
            {Object.entries(compoundColors)
              .filter(([compound]) =>
                story.strategies.some((strategy) =>
                  strategy.stints.some((stint) => stint.compound === compound),
                ),
              )
              .map(([compound, color]) => (
                <span key={compound} className="flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {compound}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-primary/20 bg-[#fff1f4] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-heading font-black">
            What was the real turning point?
          </p>
          <p className="text-sm text-black/55">
            Race Control gives us the facts; the community can debate the
            interpretation.
          </p>
        </div>
        <Link
          href={`/community?round=${story.round}`}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <MessageCircle aria-hidden="true" className="size-4" /> Discuss this
          race
        </Link>
      </div>
    </div>
  );
}
