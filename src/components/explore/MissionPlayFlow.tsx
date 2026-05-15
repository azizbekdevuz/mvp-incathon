"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { SpeakingSentence } from "@/data/speaking-challenges";
import { pickRandomSpeakingSentence } from "@/data/speaking-challenges";
import type { CampusLandmark, CampusMissionDef } from "@/data/campus-missions";
import {
  SPEECH_PASS_THRESHOLD,
  passesSpeechThreshold,
  scoreLabelFromPercent,
  similarityScore,
} from "@/lib/speech-scoring";
import {
  getWebSpeechRecognitionCtor,
  type WebSpeechRecognition,
} from "@/types/web-speech-recognition";

type Step = "intro" | "play" | "result";

export type MissionPlayFlowProps = {
  landmark: CampusLandmark;
  mission: CampusMissionDef;
  cleared: boolean;
  /** After cinematic entry — jump straight into mission mechanics */
  autoBegin: boolean;
  onClose: () => void;
  onClearLandmark: (landmarkId: string) => void;
};

function buildDemoTranscript(target: string, shouldPass: boolean): string {
  const words = target.trim().split(/\s+/);
  if (!words.length) return "";
  if (shouldPass) {
    if (words.length <= 4) return words.join(" ");
    const idx = Math.max(1, Math.floor(words.length / 2));
    return words.filter((_, i) => i !== idx).join(" ");
  }
  const cut = Math.max(2, Math.floor(words.length * 0.35));
  return `${words.slice(0, cut).join(" ")} umm no`;
}

function PanicStars({ n }: { n: CampusMissionDef["panicLevel"] }) {
  return (
    <span className="text-amber-700/90" aria-hidden>
      {"★".repeat(n)}
      <span className="text-stone-400">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function MissionPlayFlow({
  landmark,
  mission,
  cleared,
  autoBegin,
  onClose,
  onClearLandmark,
}: MissionPlayFlowProps) {
  const srSupported = useSyncExternalStore(
    () => () => {},
    () => Boolean(getWebSpeechRecognitionCtor()),
    () => false,
  );

  const [step, setStep] = useState<Step>("intro");
  const [activeSentence, setActiveSentence] = useState<SpeakingSentence | null>(
    null,
  );
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [scorePct, setScorePct] = useState(0);
  const [passed, setPassed] = useState(false);
  const [selfNote, setSelfNote] = useState<string | null>(null);
  const [npcLine, setNpcLine] = useState("");
  const [tip, setTip] = useState("");

  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const heardRef = useRef("");
  const sessionRef = useRef(0);
  const judgedRef = useRef(false);
  const autoRan = useRef(false);

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

  const judgeSpeech = useCallback(
    (spoken: string, mode: "live" | "demo" | "self") => {
      if (!activeSentence) return;
      const target = activeSentence.sentence;
      const raw = spoken.trim() ? spoken : "";
      const sim = similarityScore(target, raw || " ");
      const pct = Math.min(100, Math.max(0, sim * 100));
      const pass = mode === "self" ? true : passesSpeechThreshold(sim);
      const adj = mode === "self" ? Math.max(pct, 77) : pct;
      setTranscript(
        mode === "self" && !raw.trim()
          ? "(연습 자가판정)"
          : raw || spoken,
      );
      setScorePct(adj);
      setSelfNote(
        mode === "self"
          ? "연습 자가판정 — 실제 NPC 점수 아님."
          : mode === "demo"
            ? "데모 판정 — 발표용."
            : null,
      );
      if (pass) {
        setPassed(true);
        setNpcLine(activeSentence.npcReactionPass);
        setTip(activeSentence.nativeTip);
        onClearLandmark(landmark.id);
      } else {
        setPassed(false);
        setNpcLine(activeSentence.npcReactionFail);
        setTip(activeSentence.nativeTip);
      }
      setStep("result");
    },
    [activeSentence, landmark.id, onClearLandmark],
  );

  const startMission = useCallback(() => {
    setSelfNote(null);
    if (mission.type === "choice" && mission.choice) {
      setStep("play");
      return;
    }
    if (mission.type === "speech" && mission.speechCategoryId) {
      const s = pickRandomSpeakingSentence(mission.speechCategoryId);
      setActiveSentence(s);
      setStep("play");
      if (!s) setStep("intro");
    }
  }, [mission]);

  useLayoutEffect(() => {
    if (!autoBegin || cleared || autoRan.current) return;
    autoRan.current = true;
    startMission();
  }, [autoBegin, cleared, startMission]);

  const startListening = useCallback(() => {
    if (!activeSentence || isListening) return;
    const ctor = getWebSpeechRecognitionCtor();
    if (!ctor) return;

    heardRef.current = "";
    judgedRef.current = false;
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
      if (judgedRef.current) return;
      judgedRef.current = true;
      judgeSpeech(heardRef.current || "", "live");
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
  }, [activeSentence, isListening, judgeSpeech, stopRecognition]);

  const onDemoSpeech = () => {
    if (!activeSentence) return;
    const ok = Math.random() < 0.55;
    const fake = buildDemoTranscript(activeSentence.sentence, ok);
    judgeSpeech(fake, "demo");
  };

  const onSelfSpeech = () => {
    if (!activeSentence) return;
    judgeSpeech(activeSentence.sentence, "self");
  };

  const pickChoice = (correct: boolean) => {
    if (!mission.choice) return;
    setPassed(correct);
    setNpcLine(correct ? mission.choice.passLineKo : mission.choice.failLineKo);
    setTip(mission.choice.nativeTip);
    if (correct) onClearLandmark(landmark.id);
    setStep("result");
  };

  const rankLabel = scoreLabelFromPercent(scorePct);

  return (
    <div className="space-y-4 pb-1">
      {cleared && step === "intro" ? (
        <p className="rounded-xl border border-teal-800/15 bg-teal-50/80 px-3 py-2 text-center text-sm font-semibold text-teal-900">
          이 구역 클리어됨. 리플레이하려면 시작.
        </p>
      ) : null}

      {step === "intro" ? (
        <div className="space-y-3">
          {!autoBegin ? (
            <p className="text-center text-xs font-medium text-stone-500">
              준비되면 바로 미션으로 들어갑니다.
            </p>
          ) : null}
          <button
            type="button"
            onClick={startMission}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-800 to-teal-900 py-3.5 text-sm font-semibold text-amber-50 shadow-md transition hover:from-teal-700 hover:to-teal-800 active:scale-[0.99]"
          >
            미션 시작
          </button>
        </div>
      ) : null}

      {step === "play" && mission.type === "speech" && activeSentence ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-stone-300/60 bg-white/70 p-4 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">
              말하기 목표
            </p>
            <p className="font-display text-lg font-bold leading-snug text-stone-900 sm:text-xl">
              {activeSentence.sentence}
            </p>
            <p className="mt-2 text-xs text-stone-600">{activeSentence.koreanHint}</p>
          </div>
          {!srSupported ? (
            <p className="text-xs font-medium text-amber-800/90">
              Chrome에서 마이크 판정 권장. 지금은 데모/연습 버튼으로 진행.
            </p>
          ) : null}
          {isListening ? (
            <p className="text-center text-sm font-semibold text-teal-800 motion-safe:animate-pulse">
              듣는 중…
            </p>
          ) : null}
          <div className="grid gap-2">
            <button
              type="button"
              disabled={!srSupported || isListening}
              onClick={startListening}
              className="rounded-2xl border border-teal-800/25 bg-teal-800 py-3 text-sm font-semibold text-amber-50 hover:bg-teal-700 disabled:opacity-40"
            >
              말해보기
            </button>
            <button
              type="button"
              onClick={onDemoSpeech}
              disabled={isListening}
              className="rounded-2xl border border-stone-400/40 bg-stone-100/90 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200/90 disabled:opacity-40"
            >
              데모 판정 (발표 안전)
            </button>
            <button
              type="button"
              onClick={onSelfSpeech}
              disabled={isListening}
              className="rounded-2xl border border-stone-300/80 py-2.5 text-xs font-medium text-stone-600 hover:bg-white/80 disabled:opacity-40"
            >
              읽었다 (연습 자가판정)
            </button>
          </div>
        </div>
      ) : null}

      {step === "play" && mission.type === "choice" && mission.choice ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-800">
            {mission.choice.promptKo}
          </p>
          <p className="text-xs text-stone-500">{mission.choice.promptEn}</p>
          <div className="flex flex-col gap-2">
            {mission.choice.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => pickChoice(opt.correct)}
                className="rounded-2xl border border-stone-300/70 bg-white/80 px-4 py-3 text-left text-sm font-medium leading-snug text-stone-800 transition hover:border-teal-800/30 hover:bg-teal-50/50 active:scale-[0.99]"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === "result" ? (
        <div
          className={[
            "rounded-2xl border p-4 shadow-sm",
            passed
              ? "border-teal-800/25 bg-teal-50/90"
              : "border-amber-900/20 bg-amber-50/90",
          ].join(" ")}
        >
          <p className="font-display text-xl font-bold text-stone-900">
            {passed ? "통과" : "다시 해보기"}
          </p>
          {mission.type === "speech" && activeSentence ? (
            <p className="mt-2 font-mono text-xs text-stone-600">
              {Math.round(scorePct)}% · {rankLabel}
            </p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-stone-800">{npcLine}</p>
          <p className="mt-2 text-xs text-teal-900/90">{tip}</p>
          {selfNote ? (
            <p className="mt-2 text-[11px] text-stone-500">{selfNote}</p>
          ) : null}
          {mission.type === "speech" && activeSentence ? (
            <p className="mt-2 text-[11px] text-stone-500">
              인식: {transcript || "(없음)"} · 기준 유사도 ≥{" "}
              {(SPEECH_PASS_THRESHOLD * 100).toFixed(0)}%
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {!passed ? (
              <button
                type="button"
                onClick={() => {
                  setStep("intro");
                  setActiveSentence(null);
                }}
                className="rounded-xl border border-stone-400/50 bg-white/80 px-4 py-2 text-xs font-semibold text-stone-800"
              >
                다시 도전
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-gradient-to-r from-teal-800 to-teal-900 px-4 py-2 text-xs font-semibold text-amber-50 shadow-sm hover:from-teal-700 hover:to-teal-800"
            >
              지도로 복귀
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-stone-300/40 pt-3 text-[10px] text-stone-500">
        <span>
          난이도 {mission.difficultyLabel} · <PanicStars n={mission.panicLevel} />
        </span>
        <span className="font-medium text-stone-400">{landmark.shortLabel}</span>
      </div>
    </div>
  );
}
