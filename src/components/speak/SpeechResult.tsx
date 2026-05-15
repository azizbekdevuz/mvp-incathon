"use client";

import type { CSSProperties } from "react";
import type { SpeakingSentence } from "@/data/speaking-challenges";
import { scoreLabelFromPercent } from "@/lib/speech-scoring";

export type SpeakResultState = "idle" | "pass" | "fail";

const PASS_LINES = [
  "생존 성공. 외국인이 알아들음.",
  "문법보다 중요한 것: 전달됨.",
  "NPC가 고개를 끄덕였습니다. 기적.",
  "발음 완벽은 아니지만 인생은 계속됨.",
];

const FAIL_LINES = [
  "NPC 뇌 0.8초 정지.",
  "뜻은 있었는데 소리가 도망감.",
  "다시. 이번엔 영어처럼.",
  "Konglish 폭발. 하지만 포기 금지.",
  "마이크가 아니라 사회가 거절함.",
];

type SpeechResultProps = {
  result: SpeakResultState;
  scorePercent: number;
  transcript: string;
  targetSentence: string;
  sentence: SpeakingSentence | null;
  streak: number;
  headlineLine: string;
  rankTitle: string;
};

function pickLine(lines: string[], salt: number): string {
  return lines[salt % lines.length] ?? lines[0];
}

export function pickPassLine(salt: number): string {
  return pickLine(PASS_LINES, salt);
}

export function pickFailLine(salt: number): string {
  return pickLine(FAIL_LINES, salt);
}

export function computeRankTitle(streak: number, scorePct: number): string {
  const s = Math.round(scorePct);
  if (streak >= 6 && s >= 88) return "영어 서바이벌 MVP";
  if (streak >= 4 && s >= 80) return "캠퍼스 레전드 (아직 졸업 전)";
  if (streak >= 3 && s >= 72) return "교수님이 한번 쳐다본 등급";
  if (streak >= 2) return "카공족 영어 반란군";
  if (s >= 90) return "Native Energy 근접";
  if (s >= 75) return "생존권 확보";
  return "도전자 등급 · 아직 NPC와 협상 중";
}

export function SpeechResult({
  result,
  scorePercent,
  transcript,
  targetSentence,
  sentence,
  streak,
  headlineLine,
  rankTitle,
}: SpeechResultProps) {
  if (result === "idle") {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-zinc-950/40 p-5 text-center text-sm text-zinc-500">
        결과 대기 중 · NPC가 엎드려서 듣는 중
      </div>
    );
  }

  const pass = result === "pass";
  const band = scoreLabelFromPercent(scorePercent);

  return (
    <div
      className={[
        "reveal-open relative overflow-hidden rounded-3xl border-2 p-5 sm:p-6",
        pass
          ? "border-emerald-400/70 bg-gradient-to-br from-emerald-950/80 via-zinc-950 to-cyan-950/50"
          : "border-rose-500/60 bg-gradient-to-br from-rose-950/70 via-zinc-950 to-fuchsia-950/40",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
        style={
          {
            background: pass
              ? "rgba(52,211,153,0.22)"
              : "rgba(244,63,94,0.2)",
          } as CSSProperties
        }
      />

      <div className="relative flex flex-col items-center text-center">
        <span
          className={[
            "font-display text-5xl font-black tracking-tighter sm:text-6xl",
            pass ? "text-emerald-300 drop-shadow-[0_0_24px_rgba(52,211,153,0.45)]" : "text-rose-300 drop-shadow-[0_0_24px_rgba(251,113,133,0.4)]",
          ].join(" ")}
        >
          {pass ? "PASS" : "다시 해"}
        </span>
        <p className="mt-2 max-w-md text-sm font-bold text-zinc-200">
          {headlineLine}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white">
            {Math.round(scorePercent)}% · {band}
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-amber-200">
            연속 {streak}연승
          </span>
        </div>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <div className="bubble-npc rounded-2xl p-4 text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300">
            NPC 반응
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-white">
            {pass ? sentence?.npcReactionPass : sentence?.npcReactionFail}
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/25 p-4 text-left">
          <p className="text-[10px] font-black uppercase tracking-wider text-cyan-200">
            Native tip
          </p>
          <p className="mt-1 text-sm leading-snug text-zinc-200">
            {sentence?.nativeTip}
          </p>
        </div>
      </div>

      <div className="relative mt-4 space-y-2 rounded-2xl bg-black/35 p-4 text-left">
        <p className="text-[10px] font-bold uppercase text-zinc-500">인식 텍스트</p>
        <p className="font-mono text-sm text-cyan-100">
          {transcript.trim() ? transcript : "(빈 텍스트 — 마이크/발음 확인)"}
        </p>
        <p className="text-[10px] font-bold uppercase text-zinc-500">목표 문장</p>
        <p className="text-sm font-semibold text-zinc-200">{targetSentence}</p>
      </div>

      <div className="relative mt-4 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-500/15 to-fuchsia-600/10 p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">
          Ridiculous rank card
        </p>
        <p className="font-display mt-1 text-lg font-black text-white sm:text-xl">
          {rankTitle}
        </p>
      </div>
    </div>
  );
}
