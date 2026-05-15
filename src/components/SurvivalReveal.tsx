"use client";

import type { CSSProperties } from "react";
import type { Choice } from "@/lib/types";
import { survivalSnapshotPercent } from "@/lib/scoring";
import { randomQuip } from "@/lib/microcopy";

type SurvivalRevealProps = {
  choice: Choice;
  show: boolean;
};

export function SurvivalReveal({ choice, show }: SurvivalRevealProps) {
  const quip = randomQuip();
  const survival = survivalSnapshotPercent(choice.scores);
  const cringe = choice.scores.cringe;

  if (!show) return null;

  const literalStrike = cringe >= 50 || choice.scores.naturalness < 48;

  return (
    <div
      className="reveal-shell reveal-open space-y-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/95 to-black/90 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-fuchsia-500/20 px-2.5 py-1 text-xs font-bold text-fuchsia-200">
          생존율 {survival}%
        </span>
        <span className="rounded-full bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-100">
          크링지 {cringe}
        </span>
        {literalStrike ? (
          <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-100">
            한국식 직역 감지
          </span>
        ) : null}
      </div>

      <p className="text-sm font-semibold italic text-zinc-400">“{quip}”</p>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          NPC 반응
        </p>
        <p className="mt-1 text-base font-bold leading-snug text-cyan-200">
          {choice.reaction}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3">
          <p className="text-[11px] font-semibold text-rose-200/90">Cringe 미터</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
            <div
              className="bar-grow-rose h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
              style={{ "--bar-w": `${cringe}%` } as CSSProperties}
            />
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">높을수록 분위기 파괴</p>
        </div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3">
          <p className="text-[11px] font-semibold text-emerald-200">생존 게이지</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
            <div
              className="bar-grow-emerald h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
              style={{ "--bar-w": `${survival}%` } as CSSProperties}
            />
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            원어민 이해 {choice.scores.understood ? "△ 가능" : "✕ 어려움"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-200">
          Native upgrade
        </p>
        <p className="mt-1 font-mono text-sm text-white">{choice.nativeVersion}</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          더 안전한 버전:{" "}
          <span className="text-emerald-200">{choice.betterEnglish}</span>
        </p>
      </div>

      <div className="rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-zinc-300">
        {choice.koreanExplanation}
        {choice.warning ? (
          <p className="mt-2 text-rose-200/90">⚠ {choice.warning}</p>
        ) : null}
      </div>
    </div>
  );
}
