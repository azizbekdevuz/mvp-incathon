"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getScenarioById } from "@/data/scenarios";
import type { Choice, RunningTotals } from "@/lib/types";
import {
  applyScores,
  compositeScore,
  emptyTotals,
  pickRankTitle,
} from "@/lib/scoring";
import { GAME_DISPLAY_NAME } from "@/lib/game-meta";
import { PanicChoiceButton, type PanicRisk } from "./PanicChoiceButton";
import {
  NpcMoodCard,
  moodFromScores,
  npcMoodMeterValue,
  type NpcMood,
} from "./NpcMoodCard";
import { SurvivalReveal } from "./SurvivalReveal";

const COLD_SCENARIO_ID = "immigration";

const RISK_ORDER: PanicRisk[] = ["bad", "risky", "natural"];

type Phase = "pick" | "reveal" | "done";

type ColdOpenDemoProps = {
  onPlayFullScenario: () => void;
};

export function ColdOpenDemo({ onPlayFullScenario }: ColdOpenDemoProps) {
  const scenario = useMemo(
    () => getScenarioById(COLD_SCENARIO_ID),
    [],
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("pick");
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [totals, setTotals] = useState<RunningTotals>(() => emptyTotals());
  const [panicTick, setPanicTick] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPanicTick((t) => (t <= 0 ? 12 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const resetDemo = useCallback(() => {
    setRoundIndex(0);
    setPhase("pick");
    setLastChoice(null);
    setTotals(emptyTotals());
  }, []);

  if (!scenario) return null;

  const round = scenario.rounds[roundIndex];
  const isLastRound = roundIndex >= 2;

  const npcMood: NpcMood =
    phase === "pick" || !lastChoice
      ? "idle"
      : moodFromScores(lastChoice.scores);

  const moodMeter =
    phase === "reveal" && lastChoice
      ? npcMoodMeterValue(lastChoice.scores)
      : 36 + roundIndex * 6;

  const finalRank = phase === "done" ? pickRankTitle(scenario, totals) : null;
  const composite = phase === "done" ? compositeScore(totals, 3) : 0;

  const pickChoice = (ch: Choice) => {
    setLastChoice(ch);
    setTotals((t) => applyScores(t, ch.scores));
    setPhase("reveal");
  };

  const advance = () => {
    if (!isLastRound) {
      setRoundIndex((r) => r + 1);
      setPhase("pick");
      setLastChoice(null);
      return;
    }
    setPhase("done");
  };

  return (
    <section className="relative min-h-[100dvh] overflow-hidden pb-10 pt-0">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 px-3 py-2 backdrop-blur-md sm:py-2.5">
        <p className="mx-auto max-w-2xl text-center text-[11px] font-semibold leading-snug text-cyan-100 sm:text-xs">
          고르기만 하면 됨 → NPC가 반응함 → 자연스러운 표현 배움
        </p>
      </div>

      <div className="relative mx-auto max-w-lg px-3 sm:max-w-xl">
        <p className="pt-3 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-300/90">
          LIVE PANIC DEMO · {GAME_DISPLAY_NAME}
        </p>
        <h1 className="font-display mt-2 text-center text-2xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          지금 영어로 대답 안 하면 망함.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-center text-sm font-medium leading-snug text-zinc-400 sm:text-base">
          Konglish로 버티고, NPC 반응으로 배우는 영어 생존 게임 — 영어 앱
          아님.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Link
            href="/speak"
            className="btn-neon-primary flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black sm:text-base"
          >
            <span aria-hidden>🎤</span>
            발음 생존 모드 · 말하면 산다
          </Link>
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-fuchsia-400/60 bg-gradient-to-br from-fuchsia-950/60 to-violet-950/50 py-4 text-sm font-black text-fuchsia-100 shadow-[0_0_28px_-8px_rgba(217,70,239,0.45)] transition hover:border-cyan-400/50 hover:shadow-[0_0_36px_-6px_rgba(34,211,238,0.35)]"
          >
            <span aria-hidden>🗺️</span>
            캠퍼스 생존 지도
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {phase === "done"
              ? `생존 랭크: ${finalRank}`
              : `데모 라운드 ${roundIndex + 1}/3 · 랭크 집계 중`}
          </span>
          {phase === "done" ? (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-200">
              3라 종합 {composite}pt
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 to-violet-950/30 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-200/80">
              Panic timer
            </p>
            <p className="font-mono text-xl font-black tabular-nums text-white sm:text-2xl">
              00:{panicTick.toString().padStart(2, "0")}
            </p>
          </div>
          <p className="max-w-[12rem] text-right text-[11px] leading-tight text-zinc-400">
            가짜 압박 타이머.
            <br />
            분위기 전용 · 실제 제한 아님
          </p>
        </div>

        <div className="mt-4">
          <NpcMoodCard
            mood={npcMood}
            npcEmoji={scenario.npcEmoji}
            npcName={scenario.npcName}
            moodMeter={moodMeter}
          />
        </div>

        <div
          className="bubble-npc animate-chat-in mt-4 rounded-3xl rounded-tl-md border border-white/10 p-4 sm:p-5"
          key={roundIndex}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            NPC · English
          </p>
          <p className="mt-2 text-lg font-bold leading-snug text-white sm:text-xl">
            {round.npcMessage}
          </p>
        </div>

        {phase === "pick" ? (
          <div className="mt-4 space-y-3">
            <p className="text-center text-xs font-bold text-zinc-500">
              라운드 {roundIndex + 1}/3 · 바로 골라 (스크롤 불필요)
            </p>
            {round.choices.map((ch, i) => (
              <PanicChoiceButton
                key={ch.id}
                risk={RISK_ORDER[i] ?? "risky"}
                onClick={() => pickChoice(ch)}
              >
                {ch.text}
              </PanicChoiceButton>
            ))}
          </div>
        ) : null}

        {phase === "reveal" && lastChoice ? (
          <div className="mt-4 space-y-4">
            <SurvivalReveal
              key={`${roundIndex}-${lastChoice.text.slice(0, 24)}`}
              choice={lastChoice}
              show
            />
            <button
              type="button"
              onClick={advance}
              className="btn-neon-primary w-full rounded-2xl py-4 text-sm font-bold"
            >
              {isLastRound ? "3라 끝 — 결과 확인" : "다음 라운드 →"}
            </button>
          </div>
        ) : null}

        {phase === "done" ? (
          <div className="mt-6 space-y-4 rounded-3xl border border-cyan-500/25 bg-black/40 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              데모 종료 — 입국 심사 편
            </p>
            <p className="font-display text-xl font-black text-white">
              {finalRank}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={onPlayFullScenario}
                className="btn-neon-primary rounded-2xl px-6 py-3 text-sm font-bold"
              >
                이 시나리오 풀매치 시작
              </button>
              <button
                type="button"
                onClick={resetDemo}
                className="rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                다시 도전
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              아래에서 다른 지옥(시나리오)도 고를 수 있음.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
