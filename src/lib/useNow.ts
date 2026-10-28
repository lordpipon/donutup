"use client";

import { useEffect, useState } from "react";

/**
 * Live clock for countdowns. Starts at 0 so server and first client render
 * match, then ticks from the browser clock.
 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    // Syncing with the browser clock after mount avoids hydration mismatches.
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** Milliseconds until the next local midnight, or 0 before the clock mounts. */
export function msUntilMidnight(now: number): number {
  if (!now) return 0;
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now;
}
