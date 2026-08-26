"use client";

import { useState } from "react";
import { UserRound, UsersRound } from "lucide-react";
import { teamColor } from "@/lib/team-colors";
import type { DriverStanding, TeamStanding } from "@/types";

type LeaderboardMode = "drivers" | "teams";

type LeaderboardRow = {
  position: number;
  name: string;
  detail: string;
  points: number;
  color: string;
};

function LeaderboardRows({ rows }: { rows: LeaderboardRow[] }) {
  const maxPoints = rows[0]?.points || 1;

  return (
    <ol className="space-y-5">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="mb-2 flex items-center gap-3">
            <span className="w-5 font-mono text-xs text-black/45">
              {String(row.position).padStart(2, "0")}
            </span>
            <span
              aria-hidden="true"
              className="h-7 w-1.5 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading font-extrabold text-[#111118]">
                {row.name}
              </p>
              <p className="text-xs font-medium text-black/50">{row.detail}</p>
            </div>
            <strong className="font-heading text-xl text-[#111118]">
              {row.points}
            </strong>
            <span className="text-[10px] font-bold text-black/45">PTS</span>
          </div>
          <div className="ml-8 h-2 overflow-hidden rounded-full bg-black/[0.08]">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${(row.points / maxPoints) * 100}%`,
                backgroundColor: row.color,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function StandingsPanel({
  standings,
  teamStandings,
}: {
  standings: DriverStanding[];
  teamStandings: TeamStanding[];
}) {
  const [mode, setMode] = useState<LeaderboardMode>("drivers");
  const driverRows: LeaderboardRow[] = standings
    .slice(0, 5)
    .map((standing) => ({
      position: standing.position,
      name: standing.driver,
      detail: standing.team,
      points: standing.points,
      color: teamColor(standing.team),
    }));
  const teamRows: LeaderboardRow[] = teamStandings
    .slice(0, 5)
    .map((standing) => ({
      position: standing.position,
      name: standing.team,
      detail: `${standing.wins} ${standing.wins === 1 ? "win" : "wins"}`,
      points: standing.points,
      color: teamColor(standing.team),
    }));

  return (
    <section
      aria-labelledby="standings-heading"
      className="rounded-3xl border border-black/10 bg-white p-5 text-[#111118] shadow-sm sm:p-6"
    >
      <div className="mb-5">
        <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
          Championship
        </p>
        <h2
          id="standings-heading"
          className="font-heading text-2xl font-black tracking-tight"
        >
          Leaderboard
        </h2>
      </div>

      <div
        role="tablist"
        aria-label="Leaderboard category"
        className="mb-6 grid grid-cols-2 rounded-xl bg-black/[0.07] p-1"
      >
        {(
          [
            { value: "drivers", label: "Drivers", icon: UserRound },
            { value: "teams", label: "Teams", icon: UsersRound },
          ] as const
        ).map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(value)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                active
                  ? "bg-electric text-white shadow-sm"
                  : "text-black/55 hover:text-black"
              }`}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={`${mode} standings`}>
        <LeaderboardRows rows={mode === "drivers" ? driverRows : teamRows} />
      </div>
    </section>
  );
}
