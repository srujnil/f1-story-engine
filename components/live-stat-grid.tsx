import { CalendarDays, Flag, TrendingUp, Trophy } from "lucide-react";
import { NextRaceCountdown } from "@/components/next-race-countdown";
import type { MomentumResult, SeasonData } from "@/types";

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type StatCardProps = {
  eyebrow: string;
  value: string;
  detail: React.ReactNode;
  icon: React.ReactNode;
  className: string;
};

function StatCard({ eyebrow, value, detail, icon, className }: StatCardProps) {
  return (
    <article
      className={`min-h-44 rounded-3xl border p-5 shadow-sm transition-shadow duration-200 hover:shadow-md ${className}`}
    >
      <div className="mb-8 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">
          {eyebrow}
        </span>
        <span className="rounded-xl bg-white/70 p-2.5 shadow-sm">{icon}</span>
      </div>
      <p className="font-heading text-2xl font-extrabold leading-tight tracking-tight text-[#111118]">
        {value}
      </p>
      <div className="mt-2 text-sm font-medium text-black/60">{detail}</div>
    </article>
  );
}

export function LiveStatGrid({
  seasonData,
  momentum,
}: {
  seasonData: SeasonData;
  momentum: MomentumResult | null;
}) {
  const completed = seasonData.races.filter(
    (race) => race.status === "completed",
  );
  const latestRace = completed.at(-1);
  const latestWinner = latestRace?.podium[0];
  const nextRace = seasonData.races.find((race) => race.status === "upcoming");
  const leader = seasonData.standings[0];

  return (
    <section
      aria-label="Live season dashboard"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <StatCard
        eyebrow="Championship leader"
        value={leader?.driver ?? "Standings pending"}
        detail={
          leader
            ? `${leader.points} points · ${leader.wins} wins`
            : "Awaiting data"
        }
        icon={<Trophy aria-hidden="true" className="size-5" />}
        className="border-[#e4c35f] bg-[#fff3c9] text-[#946200]"
      />
      <StatCard
        eyebrow="Momentum leader"
        value={momentum?.driver ?? "Form building"}
        detail={
          momentum
            ? `+${momentum.delta.toFixed(1)} average positions gained`
            : "Six races needed"
        }
        icon={<TrendingUp aria-hidden="true" className="size-5" />}
        className="border-[#cbb4ef] bg-[#f0e8ff] text-[#7449b8]"
      />
      <StatCard
        eyebrow="Latest winner"
        value={latestWinner?.driver ?? "Race pending"}
        detail={
          latestRace
            ? `${latestRace.name} · ${latestWinner?.team}`
            : "No result yet"
        }
        icon={<Flag aria-hidden="true" className="size-5" />}
        className="border-[#ef9aa4] bg-[#ffe8eb] text-primary"
      />
      <StatCard
        eyebrow="Next race"
        value={nextRace?.name ?? "Season complete"}
        detail={
          nextRace ? (
            <span className="flex flex-col gap-0.5">
              <span>
                {longDate.format(new Date(nextRace.date))} · {nextRace.country}
              </span>
              <NextRaceCountdown startTime={nextRace.startTime} />
            </span>
          ) : (
            "All rounds complete"
          )
        }
        icon={<CalendarDays aria-hidden="true" className="size-5" />}
        className="border-[#94ccec] bg-[#e4f5ff] text-[#1479ad]"
      />
    </section>
  );
}
