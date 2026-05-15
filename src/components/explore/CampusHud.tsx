"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CAMPUS_ATMOSPHERE_TICKERS,
  getLandmarkById,
  getCampusMission,
} from "@/data/campus-missions";
import { RouteProgress } from "./RouteProgress";

type CampusHudProps = {
  rankLabel: string;
  cleared: number;
  total: number;
  clearedIds: readonly string[];
  suggestedNextId: string | null;
};

function PanicStars({ n }: { n: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="text-amber-800/85" aria-hidden>
      {"★".repeat(n)}
      <span className="text-stone-400">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function CampusHud({
  rankLabel,
  cleared,
  total,
  clearedIds,
  suggestedNextId,
}: CampusHudProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTick((t) => (t + 1) % CAMPUS_ATMOSPHERE_TICKERS.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const line =
    CAMPUS_ATMOSPHERE_TICKERS[tick] ?? CAMPUS_ATMOSPHERE_TICKERS[0];

  const nextLm = suggestedNextId ? getLandmarkById(suggestedNextId) : undefined;
  const nextMission = nextLm ? getCampusMission(nextLm.missionId) : undefined;

  const nextLine = useMemo(() => {
    if (!nextLm) return "추천 스테이지 없음 — 자유 탐험";
    return `다음: ${nextLm.shortLabel}`;
  }, [nextLm]);

  return (
    <header className="fixed left-0 right-0 top-0 z-[60] px-2 pt-[max(0.35rem,env(safe-area-inset-top))] sm:px-4">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-1.5 rounded-2xl border border-stone-500/15 bg-[#f7f2ea]/[0.92] px-2.5 py-2 shadow-[0_12px_40px_-28px_rgba(62,54,46,0.45)] backdrop-blur-md sm:flex-row sm:items-center sm:gap-3 sm:px-3 sm:py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 sm:flex-nowrap">
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-stone-400/25 bg-white/60 px-2 py-1 text-[10px] font-bold text-stone-600 hover:bg-white"
          >
            ←
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-wide text-teal-900/80">
              {rankLabel}
            </p>
            <p className="truncate text-[9px] font-medium text-stone-500">
              클리어 {cleared}/{total}
            </p>
          </div>
          <span className="hidden h-6 w-px bg-stone-400/25 sm:block" aria-hidden />
          <div className="min-w-0 flex-1 sm:max-w-[min(42vw,320px)]">
            <p className="truncate text-[10px] font-semibold text-stone-800">
              {nextLine}
            </p>
            {nextMission ? (
              <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-medium text-stone-500">
                <span className="shrink-0 rounded bg-stone-900/[0.06] px-1 py-0.5 font-mono text-[8px] text-stone-600">
                  LIVE
                </span>
                <span className="truncate">난이도 {nextMission.difficultyLabel}</span>
                <PanicStars n={nextMission.panicLevel} />
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-400/15 pt-1.5 sm:border-t-0 sm:pt-0">
          <RouteProgress clearedIds={clearedIds} className="shrink-0" />
          <p className="line-clamp-1 min-w-0 flex-1 text-[9px] font-medium text-stone-500 sm:max-w-[200px]">
            {line}
          </p>
          <Link
            href="/speak"
            className="shrink-0 rounded-full border border-teal-800/20 bg-white/70 px-2.5 py-1 text-[9px] font-bold text-teal-900 hover:border-teal-800/40"
          >
            연습
          </Link>
        </div>
      </div>
    </header>
  );
}
