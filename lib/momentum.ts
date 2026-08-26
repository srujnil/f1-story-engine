import type { DriverForm, MomentumResult } from "@/types";

const WINDOW_SIZE = 3;

function average(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * Momentum rule (v0, see SPEC.md): split each driver's last 6 finishing
 * positions into two windows of 3 — "prior" and "recent" — and compare the
 * averages. Lower finishing position is better, so a driver whose recent
 * average is *lower* than their prior average is improving; the size of that
 * drop is their momentum score. No weighting, no ML — just enough to rank
 * drivers by "who's trending up right now."
 *
 * Returns null if there's no data to compare (defensive — shouldn't happen
 * with well-formed mock/API data, but an empty spotlight is better than a
 * crash).
 */
export function computeMomentum(drivers: DriverForm[]): MomentumResult | null {
  const results = rankMomentum(drivers);

  if (results.length === 0) return null;

  return results[0];
}

export function rankMomentum(drivers: DriverForm[]): MomentumResult[] {
  return drivers
    .filter((d) => d.last6Positions.length >= WINDOW_SIZE * 2)
    .map((d) => {
      const prior = d.last6Positions.slice(0, WINDOW_SIZE);
      const recent = d.last6Positions.slice(WINDOW_SIZE, WINDOW_SIZE * 2);
      const delta = average(prior) - average(recent);
      return { driver: d.driver, team: d.team, delta };
    })
    .sort((left, right) => right.delta - left.delta);
}
