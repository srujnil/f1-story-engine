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

export function NextRaceCountdown({ startTime }: { startTime: string | null }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!startTime) return;
    const update = () => setLabel(timeRemaining(startTime));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [startTime]);

  return <span>{label ?? "Race time to be confirmed"}</span>;
}
