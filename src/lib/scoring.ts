import type { ChoiceScores, RunningTotals, Scenario } from "./types";

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export function emptyTotals(): RunningTotals {
  return {
    naturalness: 0,
    survival: 0,
    cringe: 0,
    confidence: 0,
    understoodCount: 0,
  };
}

export function applyScores(totals: RunningTotals, s: ChoiceScores): RunningTotals {
  return {
    naturalness: totals.naturalness + s.naturalness,
    survival: totals.survival + s.survival,
    cringe: totals.cringe + s.cringe,
    confidence: totals.confidence + s.confidence,
    understoodCount: totals.understoodCount + (s.understood ? 1 : 0),
  };
}

/** 0–100 composite for picking rank label */
export function compositeScore(totals: RunningTotals, rounds: number): number {
  const n = rounds || 1;
  const avgNat = totals.naturalness / n;
  const avgSur = totals.survival / n;
  const avgCringe = totals.cringe / n;
  const avgConf = totals.confidence / n;
  const understoodBonus = (totals.understoodCount / n) * 18;
  const raw =
    avgNat * 0.22 +
    avgSur * 0.35 +
    avgConf * 0.2 -
    avgCringe * 0.28 +
    understoodBonus;
  return clamp(Math.round(raw), 0, 100);
}

export function survivalChancePercent(totals: RunningTotals): number {
  const sur = clamp(totals.survival / 3, 0, 100);
  const cringePenalty = clamp(totals.cringe / 36, 0, 40);
  return clamp(Math.round(sur - cringePenalty), 0, 99);
}

/** One-shot display % for homepage demo / single answer. */
export function survivalSnapshotPercent(scores: {
  survival: number;
  cringe: number;
  naturalness: number;
}): number {
  const raw =
    scores.survival * 0.62 - scores.cringe * 0.35 + scores.naturalness * 0.18;
  return clamp(Math.round(raw), 3, 97);
}

export function pickRankTitle(scenario: Scenario, totals: RunningTotals): string {
  const ladder = scenario.rankLadder;
  if (ladder.length === 0) return "??? Rank";
  const c = compositeScore(totals, 3);
  const idx = Math.min(
    ladder.length - 1,
    Math.floor((c / 100) * ladder.length),
  );
  return ladder[idx] ?? ladder[ladder.length - 1];
}
