"use client";

import { useEffect, useState } from "react";

function timeRemaining(target: string): string {
  const milliseconds = new Date(target).getTime() - Date.now();
  if (milliseconds <= 0) return "Race weekend is live";

  const totalHours = Math.floor(milliseconds / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}d ${hours}h to lights out`;
}

// Jolpica often has no start time for a round until the weekend is close.
// Rather than showing "to be confirmed" for weeks, count down to the race
// date (which is always known) until a real start time appears.
function daysToRaceDay(date: string): string {
  const days = Math.ceil(
    (new Date(`${date}T00:00:00Z`).getTime() - Date.now()) / 86_400_000,
  );
  if (days > 1) return `${days} days to race day`;
  if (days === 1) return "Race day is tomorrow";
  return "Race weekend is live";
}

export function NextRaceCountdown({
  startTime,
  date,
}: {
  startTime: string | null;
  date?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime && !date) return;
    const update = () =>
      setLabel(startTime ? timeRemaining(startTime) : daysToRaceDay(date!));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [startTime, date]);

  return <span>{label ?? "Race time to be confirmed"}</span>;
}
