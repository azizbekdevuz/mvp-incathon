"use client";

import { useEffect, useState } from "react";
import type { RunningTotals } from "@/lib/types";
import { survivalChancePercent } from "@/lib/scoring";

type ScorePanelProps = {
  totals: RunningTotals;
  roundsPlayed: number;
};

function Bar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-medium text-zinc-400">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ease-out ${colorClass}`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

export function ScorePanel({ totals, roundsPlayed }: ScorePanelProps) {
  const n = Math.max(1, roundsPlayed);
  const chance = survivalChancePercent(totals);
  const avgNat = totals.naturalness / n;
  const avgSur = totals.survival / n;
  const avgCr = totals.cringe / n;
  const avgConf = totals.confidence / n;

  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          실시간 지표
        </p>
        <p className="text-sm font-bold text-cyan-200">
          Survival chance: {chance}%
        </p>
      </div>
      <div className="mt-3 space-y-3">
        <Bar label="Naturalness (avg)" value={avgNat} colorClass="bg-gradient-to-r from-cyan-400 to-emerald-400" />
        <Bar label="Survival (avg)" value={avgSur} colorClass="bg-gradient-to-r from-violet-400 to-fuchsia-400" />
        <Bar label="Confidence (avg)" value={avgConf} colorClass="bg-gradient-to-r from-amber-300 to-orange-400" />
        <Bar label="Cringe (avg)" value={avgCr} colorClass="bg-gradient-to-r from-rose-400 to-red-500" />
      </div>
      <p className="mt-3 text-[11px] text-zinc-500">
        Meaning radar: 원어민 이해도 카운트 {totals.understoodCount}/{n}{" "}
        (라운드 누적)
      </p>
    </div>
  );
}
