import type { Scenario } from "./types";

export type ScenarioTeaser = {
  npcLine: string;
  badAnswer: string;
  failSticker: string;
};

/** Preview copy for scenario grid — worst cringe choice of round 1. */
export function getScenarioTeaser(s: Scenario): ScenarioTeaser {
  const round0 = s.rounds[0];
  const worst = [...round0.choices].sort(
    (a, b) => b.scores.cringe - a.scores.cringe,
  )[0];
  return {
    npcLine: round0.npcMessage,
    badAnswer: worst?.text ?? "",
    failSticker: worst
      ? `수상함 +${worst.scores.cringe} · 크링지 에너지 폭발`
      : "상황 불명",
  };
}
