"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  SPEAKING_CATEGORIES,
  type SpeakingSentence,
} from "@/data/speaking-challenges";
import {
  getWebSpeechRecognitionCtor,
  type WebSpeechRecognition,
} from "@/types/web-speech-recognition";
import {
  SPEECH_PASS_THRESHOLD,
  passesSpeechThreshold,
  similarityScore,
} from "@/lib/speech-scoring";
import { CategoryRail } from "./CategoryRail";
import { MicButton } from "./MicButton";
import { PanicMeter } from "./PanicMeter";
import { SentenceCard } from "./SentenceCard";
import {
  SpeechResult,
  computeRankTitle,
  pickFailLine,
  pickPassLine,
} from "./SpeechResult";
import type { SpeakResultState } from "./SpeechResult";
import { SpeakRules } from "./SpeakRules";

const FLOAT_CHAOS = [
  "less ice",
  "one plus one",
  "assignment corrupted",
  "networking?",
  "broke student edition",
];

type NpcMood = "calm" | "confused" | "concerned" | "impressed" | "emotionally_damaged";

function moodLabel(m: NpcMood): string {
  const map: Record<NpcMood, string> = {
    calm: "차분",
    confused: "혼란",
    concerned: "불안",
    impressed: "감탄",
    emotionally_damaged: "정신적 피해",
  };
  return map[m];
}

function resolveNpcMood(
  result: SpeakResultState,
  listening: boolean,
  panic: number,
  scorePct: number,
): NpcMood {
  if (listening) return "concerned";
  if (result === "idle") return panic > 55 ? "confused" : "calm";
  if (result === "fail") return panic > 48 ? "emotionally_damaged" : "confused";
  if (result === "pass") return scorePct >= 86 ? "impressed" : "calm";
  return "calm";
}

function buildDemoTranscript(target: string, shouldPass: boolean): string {
  const words = target.trim().split(/\s+/);
  if (!words.length) return "";
  if (shouldPass) {
    if (words.length <= 4) return words.join(" ");
    const idx = Math.max(1, Math.floor(words.length / 2));
    return words.filter((_, i) => i !== idx).join(" ");
  }
  const cut = Math.max(2, Math.floor(words.length * 0.38));
  return `${words.slice(0, cut).join(" ")} umm wait no`;
}

export function SpeakGame() {
  const [categoryId, setCategoryId] = useState(SPEAKING_CATEGORIES[0]?.id ?? "");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [scorePercent, setScorePercent] = useState(0);
  const [result, setResult] = useState<SpeakResultState>("idle");
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [panicLevel, setPanicLevel] = useState(12);
  const [headlineLine, setHeadlineLine] = useState("");
  const [selfNote, setSelfNote] = useState<string | null>(null);
  const [awkwardTick, setAwkwardTick] = useState(10);
  const srSupported = useSyncExternalStore(
    () => () => {},
    () => Boolean(getWebSpeechRecognitionCtor()),
    () => false,
  );

  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const heardRef = useRef("");
  const sessionRef = useRef(0);
  const judgedForSessionRef = useRef(false);

  const category = useMemo(
    () => SPEAKING_CATEGORIES.find((c) => c.id === categoryId),
    [categoryId],
  );

  const sentence: SpeakingSentence | null = useMemo(() => {
    const list = category?.sentences;
    if (!list?.length) return null;
    return list[sentenceIndex % list.length] ?? null;
  }, [category, sentenceIndex]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAwkwardTick((t) => (t <= 0 ? 10 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  const applyJudgment = useCallback(
    (spoken: string, mode: "live" | "demo" | "self") => {
      if (!sentence) return;
      const target = sentence.sentence;
      const raw = spoken.trim() ? spoken : "";
      const sim = similarityScore(target, raw || " ");
      const pct = Math.min(100, Math.max(0, sim * 100));
      const pass = mode === "self" ? true : passesSpeechThreshold(sim);
      const adjustedPct = mode === "self" ? Math.max(pct, 77) : pct;

      setTranscript(
        mode === "self" && !raw.trim()
          ? "(연습 자가판정 — 실제 음성 없음)"
          : raw || spoken,
      );
      setScorePercent(adjustedPct);
      const salt = Math.floor(performance.now()) % 10_000;
      setHeadlineLine(pass ? pickPassLine(salt) : pickFailLine(salt));
      setAttempts((prev) => prev + 1);
      setSelfNote(
        mode === "self"
          ? "발표·연습용 자가판정. 실제 NPC 생존 점수 아님."
          : mode === "demo"
            ? "데모 판정: 랜덤 시뮬. 실제 발음과 다를 수 있음."
            : null,
      );

      if (pass) {
        setResult("pass");
        setStreak((s) => s + 1);
        setPanicLevel((p) => Math.max(0, p - 9));
      } else {
        setResult("fail");
        setStreak(0);
        setPanicLevel((p) => Math.min(100, p + 14));
      }
    },
    [sentence],
  );

  const startListening = useCallback(() => {
    if (!sentence || isListening) return;
    const ctor = getWebSpeechRecognitionCtor();
    if (!ctor) return;

    setResult("idle");
    setTranscript("");
    setSelfNote(null);
    heardRef.current = "";
    judgedForSessionRef.current = false;
    const mySession = ++sessionRef.current;
    stopRecognition();

    const rec = new ctor();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      if (sessionRef.current !== mySession) return;
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i]?.[0]?.transcript ?? "";
      }
      heardRef.current = text;
      setTranscript(text);
    };

    rec.onerror = () => {
      if (sessionRef.current !== mySession) return;
      setIsListening(false);
    };

    rec.onend = () => {
      if (sessionRef.current !== mySession) return;
      recognitionRef.current = null;
      setIsListening(false);
      if (judgedForSessionRef.current) return;
      judgedForSessionRef.current = true;
      if (sentence) {
        applyJudgment(heardRef.current || "", "live");
      }
    };

    rec.onstart = () => {
      if (sessionRef.current !== mySession) return;
      setIsListening(true);
    };

    try {
      rec.start();
    } catch {
      stopRecognition();
    }
  }, [applyJudgment, isListening, sentence, stopRecognition]);

  const onDemoJudge = useCallback(() => {
    if (!sentence) return;
    setResult("idle");
    setSelfNote(null);
    const passRoll = Math.random() < 0.58;
    const fake = buildDemoTranscript(sentence.sentence, passRoll);
    applyJudgment(fake, "demo");
  }, [applyJudgment, sentence]);

  const onSelfSaid = useCallback(() => {
    if (!sentence) return;
    setResult("idle");
    setSelfNote(null);
    applyJudgment(sentence.sentence, "self");
  }, [applyJudgment, sentence]);

  const onNextSentence = useCallback(() => {
    if (!category?.sentences.length) return;
    setSentenceIndex((i) => (i + 1) % category.sentences.length);
    setResult("idle");
    setTranscript("");
    setScorePercent(0);
    setSelfNote(null);
  }, [category]);

  const onRetry = useCallback(() => {
    setResult("idle");
    setTranscript("");
    setSelfNote(null);
  }, []);

  const onPickCategory = useCallback((id: string) => {
    setCategoryId(id);
    setSentenceIndex(0);
    setResult("idle");
    setTranscript("");
    setScorePercent(0);
    setSelfNote(null);
  }, []);

  const npcMood = resolveNpcMood(result, isListening, panicLevel, scorePercent);
  const rankTitle = computeRankTitle(streak, scorePercent);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-zinc-950 pb-16 pt-0 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="konglish-aurora absolute inset-0 opacity-80" />
        {FLOAT_CHAOS.map((w, i) => (
          <span
            key={w}
            className="float-label font-display text-sm font-black text-white/15 sm:text-base"
            style={{
              left: `${8 + i * 16}%`,
              top: `${12 + (i % 3) * 22}%`,
              animationDuration: `${10 + i * 2}s`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {w}
          </span>
        ))}
      </div>

      <header className="relative z-10 border-b border-white/10 bg-zinc-950/85 px-3 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="text-[11px] font-bold text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            ← 메인 생존 게임
          </Link>
          <span className="rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-100 shadow-[0_0_20px_-6px_rgba(251,113,133,0.55)]">
            LIVE PANIC MODE
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl px-3 pt-4 sm:px-5 sm:pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-fuchsia-300">
              Speak or Get Roasted
            </p>
            <h1 className="font-display text-4xl font-black leading-none tracking-tight text-white sm:text-5xl md:text-6xl">
              말하면 산다.
            </h1>
            <p className="mt-2 max-w-xl text-sm font-bold text-cyan-100/90 sm:text-base">
              영어 문장 읽고 살아남는 발음 생존 게임
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-black/40 px-4 py-2 text-right font-mono">
            <p className="text-[9px] font-bold uppercase text-zinc-500">
              before awkward silence
            </p>
            <p className="text-xl font-black tabular-nums text-cyan-200">
              00:{awkwardTick.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        <SpeakRules />

        <div className="mt-4">
          <CategoryRail
            categories={SPEAKING_CATEGORIES}
            selectedId={categoryId}
            onSelect={onPickCategory}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
          <div className="space-y-4">
            <SentenceCard
              sentence={sentence}
              categoryEmoji={category?.emoji}
              isListening={isListening}
            />

            {!srSupported ? (
              <p className="rounded-2xl border border-amber-400/35 bg-amber-950/25 px-4 py-3 text-sm font-semibold leading-snug text-amber-100">
                Chrome에서 열면 마이크 판정 가능. 지금은 연습 모드로 진행 가능.
              </p>
            ) : null}

            {selfNote ? (
              <p className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-bold text-zinc-300">
                {selfNote}
              </p>
            ) : null}

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-8">
              <MicButton
                isListening={isListening}
                disabled={!sentence || result !== "idle"}
                onClick={startListening}
                supported={srSupported}
              />
              <div className="flex w-full max-w-sm flex-col gap-2 sm:pt-4">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={!srSupported || !sentence || isListening || result !== "idle"}
                  className="btn-neon-primary w-full rounded-2xl py-4 text-sm font-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Try Speaking · 읽기 도전
                </button>
                <button
                  type="button"
                  onClick={onDemoJudge}
                  disabled={!sentence || isListening}
                  className="w-full rounded-2xl border-2 border-fuchsia-400/50 bg-fuchsia-950/30 py-3 text-sm font-black text-fuchsia-100 transition-all hover:border-fuchsia-300 hover:bg-fuchsia-900/40 active:scale-[0.98] disabled:opacity-40"
                >
                  데모 판정 (발표 안전장치)
                </button>
                <button
                  type="button"
                  onClick={onSelfSaid}
                  disabled={!sentence || isListening}
                  className="w-full rounded-2xl border border-white/15 bg-zinc-900/80 py-3 text-xs font-bold text-zinc-200 transition-all hover:border-cyan-400/40 hover:text-white active:scale-[0.98] disabled:opacity-40"
                >
                  읽었다 (연습 자가판정 · 실제 NPC 아님)
                </button>
              </div>
            </div>

            {isListening ? (
              <p className="animate-pulse text-center text-sm font-black text-cyan-200">
                듣는 중… 영어 생존권 심사 중
              </p>
            ) : null}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                NPC mood
              </p>
              <p className="font-display mt-1 text-2xl font-black text-white">
                {moodLabel(npcMood)}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                상태: {npcMood} / 패닉과 결과에 따라 변함
              </p>
            </div>
            <PanicMeter value={panicLevel} />
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm">
              <p className="text-[10px] font-black uppercase text-emerald-300">
                시도 / 연승
              </p>
              <p className="mt-1 font-mono text-lg font-black text-white">
                {attempts} tries · streak {streak}
              </p>
              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                통과 기준 유사도 ≥{" "}
                {(SPEECH_PASS_THRESHOLD * 100).toFixed(0)}% 부근 (노이즈 허용)
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 space-y-4">
          <SpeechResult
            result={result}
            scorePercent={scorePercent}
            transcript={transcript}
            targetSentence={sentence?.sentence ?? ""}
            sentence={sentence}
            streak={streak}
            headlineLine={headlineLine}
            rankTitle={rankTitle}
          />

          {result === "pass" ? (
            <button
              type="button"
              onClick={onNextSentence}
              className="btn-neon-primary w-full rounded-2xl py-4 text-base font-black shadow-lg active:scale-[0.98]"
            >
              Next Sentence · 다음 문장
            </button>
          ) : null}
          {result === "fail" ? (
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-2xl border-2 border-rose-400/60 bg-rose-600/20 py-4 text-base font-black text-rose-50 transition-all hover:bg-rose-600/30 active:scale-[0.98]"
            >
              Retry · 다시 도전
            </button>
          ) : null}
        </div>
      </main>
    </div>
  );
}
