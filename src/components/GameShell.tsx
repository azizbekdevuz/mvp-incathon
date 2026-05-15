"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import type { Choice, Scenario, TurnRecord } from "@/lib/types";
import { emptyTotals, applyScores } from "@/lib/scoring";
import { manualChoiceFromText } from "@/lib/manual-fallback";
import { ChatBubble } from "./ChatBubble";
import { FeedbackCard } from "./FeedbackCard";
import { ScorePanel } from "./ScorePanel";

type GameShellProps = {
  scenario: Scenario;
  onExit: () => void;
  onFinish: (turns: TurnRecord[]) => void;
};

type ChatLine =
  | { id: string; role: "system"; text: string }
  | { id: string; role: "npc"; text: string }
  | { id: string; role: "you"; text: string };

export function GameShell({ scenario, onExit, onFinish }: GameShellProps) {
  const baseId = useId();
  const turnsRef = useRef<TurnRecord[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [step, setStep] = useState<"answer" | "review">("answer");
  const [lines, setLines] = useState<ChatLine[]>(() => [
    { id: `${baseId}-s0`, role: "system", text: scenario.introKo },
    {
      id: `${baseId}-n0`,
      role: "npc",
      text: scenario.rounds[0].npcMessage,
    },
  ]);
  const [totals, setTotals] = useState(emptyTotals);
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualText, setManualText] = useState("");

  const round = scenario.rounds[roundIndex];
  const roundsPlayed = turns.length;

  const understoodLabel = useMemo(() => {
    if (!lastChoice) return "";
    return lastChoice.scores.understood
      ? "Foreigner understood you: mostly yes (뉘앙스는 별개)"
      : "Foreigner understood you: ehh… 뇌가 0.5초 정지함";
  }, [lastChoice]);

  const pushLines = useCallback((next: ChatLine[]) => {
    setLines((prev) => [...prev, ...next]);
  }, []);

  const handlePick = (choice: Choice, manual: boolean) => {
    if (step !== "answer") return;
    const youLine: ChatLine = {
      id: `${baseId}-u-${roundIndex}-${choice.id}-${manual ? "m" : "c"}`,
      role: "you",
      text: choice.text,
    };
    const npcLine: ChatLine = {
      id: `${baseId}-r-${roundIndex}-${choice.id}-${manual ? "m" : "c"}`,
      role: "npc",
      text: choice.reaction,
    };
    pushLines([youLine, npcLine]);
    setTotals((t) => applyScores(t, choice.scores));
    const rec: TurnRecord = {
      roundIndex,
      choiceText: choice.text,
      choice,
      manual,
    };
    turnsRef.current = [...turnsRef.current, rec];
    setTurns(turnsRef.current);
    setLastChoice(choice);
    setStep("review");
    setManualText("");
    setManualOpen(false);
  };

  const handleManualSubmit = () => {
    handlePick(manualChoiceFromText(manualText), true);
  };

  const handleContinue = () => {
    if (step !== "review") return;
    if (roundIndex < 2) {
      const nextRound = roundIndex + 1;
      setRoundIndex(nextRound);
      pushLines([
        {
          id: `${baseId}-n${nextRound}`,
          role: "npc",
          text: scenario.rounds[nextRound].npcMessage,
        },
      ]);
      setStep("answer");
      setLastChoice(null);
      return;
    }
    onFinish(turnsRef.current);
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col px-3 pb-8 pt-4 sm:max-w-xl">
      <header className="glass-panel sticky top-3 z-20 mb-3 flex items-center gap-3 rounded-2xl px-3 py-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10"
        >
          ← 나가기
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">
            {scenario.npcEmoji} {scenario.npcName}
          </p>
          <p className="truncate text-[11px] text-zinc-500">
            {scenario.titleKo} · {scenario.npcPersonality}
          </p>
        </div>
      </header>

      <ScorePanel totals={totals} roundsPlayed={Math.max(1, roundsPlayed)} />

      <div className="mt-4 flex flex-1 flex-col gap-2 rounded-3xl border border-white/5 bg-black/20 p-3 sm:p-4">
        {lines.map((l) => (
          <ChatBubble key={l.id} role={l.role}>
            {l.role === "system" ? (
              <span className="text-zinc-400">{l.text}</span>
            ) : (
              l.text
            )}
          </ChatBubble>
        ))}
      </div>

      {step === "answer" ? (
        <div className="mt-4 space-y-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
             Round {roundIndex + 1}/3 — 골라 (또는 직접 입력)
          </p>
          <div className="grid gap-2">
            {round.choices.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => handlePick(ch, false)}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 px-4 py-3 text-left text-sm font-medium text-zinc-100 transition hover:border-cyan-400/40 hover:shadow-[0_0_24px_-8px_rgba(34,211,238,0.6)] active:scale-[0.99]"
              >
                {ch.text}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setManualOpen((v) => !v)}
            className="w-full rounded-2xl border border-dashed border-white/15 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
          >
            {manualOpen ? "직접 입력 닫기" : "직접 입력 열기 (옵션)"}
          </button>
          {manualOpen ? (
            <div className="glass-panel rounded-2xl p-3">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="한국어 섞어도 됨. NPC가 대충 감지함 (MVP)."
                className="min-h-[88px] w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-500/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleManualSubmit}
                className="btn-neon-ghost mt-2 w-full rounded-xl py-2 text-sm font-semibold"
              >
                Send custom line
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-center text-xs font-semibold text-cyan-200/90">
            {understoodLabel}
          </p>
          {lastChoice ? <FeedbackCard choice={lastChoice} /> : null}
          <button
            type="button"
            onClick={handleContinue}
            className="btn-neon-primary w-full rounded-2xl py-3 text-sm font-semibold"
          >
            {roundIndex < 2 ? "Next round →" : "결과 보기"}
          </button>
        </div>
      )}
    </div>
  );
}
