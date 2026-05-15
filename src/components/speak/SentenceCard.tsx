"use client";

import type { SpeakingSentence } from "@/data/speaking-challenges";

type SentenceCardProps = {
  sentence: SpeakingSentence | null;
  categoryEmoji?: string;
  isListening: boolean;
};

export function SentenceCard({
  sentence,
  categoryEmoji,
  isListening,
}: SentenceCardProps) {
  if (!sentence) {
    return (
      <div className="glass-panel flex min-h-[200px] items-center justify-center rounded-3xl p-6 text-center text-zinc-500">
        문장 로딩…
      </div>
    );
  }

  return (
    <div
      className={[
        "relative overflow-hidden rounded-3xl border-2 p-5 sm:p-7",
        "bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-indigo-950/90",
        isListening
          ? "border-cyan-400 shadow-[0_0_40px_-8px_rgba(34,211,238,0.45)]"
          : "border-white/15 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)]",
      ].join(" ")}
    >
      {isListening ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.12),transparent_50%)]" />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {categoryEmoji ? (
          <span className="text-xl" aria-hidden>
            {categoryEmoji}
          </span>
        ) : null}
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-200">
          {sentence.funnyTag}
        </span>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
            sentence.dangerLevel === "nuclear"
              ? "bg-rose-600/30 text-rose-100"
              : sentence.dangerLevel === "spicy"
                ? "bg-amber-500/25 text-amber-100"
                : "bg-emerald-500/20 text-emerald-100",
          ].join(" ")}
        >
          danger: {sentence.dangerLevel}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold text-zinc-500">상황</p>
      <p className="mt-1 text-sm font-bold text-zinc-300">{sentence.situation}</p>
      <p className="font-display mt-6 text-2xl font-black leading-snug tracking-tight text-white sm:text-3xl md:text-4xl">
        {sentence.sentence}
      </p>
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-3">
        <p className="text-[11px] font-bold text-fuchsia-300">한국어 힌트</p>
        <p className="mt-1 text-sm text-zinc-200">{sentence.koreanHint}</p>
      </div>
    </div>
  );
}
