"use client";

import type { Scenario, TurnRecord } from "@/lib/types";
import {
  compositeScore,
  pickRankTitle,
  survivalChancePercent,
} from "@/lib/scoring";

type ResultCardProps = {
  scenario: Scenario;
  turns: TurnRecord[];
  onPlayAgain: () => void;
  onPickScenario: () => void;
};

export function ResultCard({
  scenario,
  turns,
  onPlayAgain,
  onPickScenario,
}: ResultCardProps) {
  const totals = turns.reduce(
    (acc, t) => ({
      naturalness: acc.naturalness + t.choice.scores.naturalness,
      survival: acc.survival + t.choice.scores.survival,
      cringe: acc.cringe + t.choice.scores.cringe,
      confidence: acc.confidence + t.choice.scores.confidence,
      understoodCount:
        acc.understoodCount + (t.choice.scores.understood ? 1 : 0),
    }),
    {
      naturalness: 0,
      survival: 0,
      cringe: 0,
      confidence: 0,
      understoodCount: 0,
    },
  );

  const rank = pickRankTitle(scenario, totals);
  const comp = compositeScore(totals, 3);
  const chance = survivalChancePercent(totals);

  const headline =
    comp >= 72
      ? "오… 이 정도면 실전에서도 버팀."
      : comp >= 48
        ? "Konglish detected. But survival possible."
        : "교수님/입국/카운터 동시에 만나는 꿈은 아직 이르다.";

  return (
    <div className="glass-panel mx-auto max-w-lg rounded-3xl p-6 sm:p-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
        RUN COMPLETE
      </p>
      <h3 className="font-display mt-3 text-center text-2xl font-bold text-white sm:text-3xl">
        {scenario.titleKo} Rank
      </h3>
      <p className="mt-2 text-center text-lg font-semibold text-cyan-200">{rank}</p>
      <p className="mt-3 text-center text-sm leading-relaxed text-zinc-300">
        {headline}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/30 px-3 py-3 text-center">
          <p className="text-[11px] text-zinc-500">Composite</p>
          <p className="mt-1 text-xl font-bold text-white">{comp}</p>
        </div>
        <div className="rounded-2xl bg-black/30 px-3 py-3 text-center">
          <p className="text-[11px] text-zinc-500">Survival chance</p>
          <p className="mt-1 text-xl font-bold text-cyan-200">{chance}%</p>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500">
        공유용 한 줄:{" "}
        <span className="text-zinc-300">
          「{scenario.titleKo} Rank: {rank}」
        </span>
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn-neon-primary flex-1 rounded-2xl py-3 text-sm font-semibold"
        >
          Play Again
        </button>
        <button
          type="button"
          onClick={onPickScenario}
          className="btn-neon-ghost flex-1 rounded-2xl py-3 text-sm font-semibold"
        >
          Choose Another Scenario
        </button>
      </div>
    </div>
  );
}
