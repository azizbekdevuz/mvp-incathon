"use client";

import { useEffect, useState } from "react";
import { CAMPUS_ATMOSPHERE_TICKERS } from "@/data/campus-missions";
import { RouteProgress } from "./RouteProgress";

type ZoneStatusProps = {
  clearedIds: readonly string[];
  cleared: number;
  total: number;
};

export function ZoneStatus({ clearedIds, cleared, total }: ZoneStatusProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % CAMPUS_ATMOSPHERE_TICKERS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const line =
    CAMPUS_ATMOSPHERE_TICKERS[tick] ?? CAMPUS_ATMOSPHERE_TICKERS[0];

  return (
    <div className="rounded-2xl border border-stone-400/25 bg-white/55 px-3 py-2.5 shadow-sm backdrop-blur-sm sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-800/15 bg-amber-100/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-950/90">
          캠퍼스 소문
        </span>
        <span className="text-[11px] font-medium text-stone-600">{line}</span>
        <span className="ml-auto font-mono text-xs font-semibold text-teal-900/90">
          {cleared}/{total}
        </span>
      </div>
      <div className="mt-2.5">
        <RouteProgress clearedIds={clearedIds} className="gap-1.5" />
      </div>
    </div>
  );
}
