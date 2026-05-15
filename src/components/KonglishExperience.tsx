"use client";

import { useCallback, useState } from "react";
import { SCENARIOS } from "@/data/scenarios";
import type { Scenario, TurnRecord } from "@/lib/types";
import { GAME_DISPLAY_NAME } from "@/lib/game-meta";
import { AnimatedBackdrop } from "./AnimatedBackdrop";
import { ColdOpenDemo } from "./ColdOpenDemo";
import { GameShell } from "./GameShell";
import { ResultCard } from "./ResultCard";
import { ScenarioPreview } from "./ScenarioPreview";
import { WhyDifferent } from "./WhyDifferent";

type Screen = "home" | "game" | "result";

export function KonglishExperience() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastTurns, setLastTurns] = useState<TurnRecord[]>([]);

  const scrollToScenarios = () => {
    document.getElementById("scenarios")?.scrollIntoView({ behavior: "smooth" });
  };

  const openImmigrationFull = useCallback(() => {
    const s = SCENARIOS.find((x) => x.id === "immigration");
    if (!s) return;
    setSelectedId(s.id);
    setActiveScenario(s);
    setScreen("game");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openScenario = useCallback((id: string) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    setSelectedId(id);
    setActiveScenario(s);
    setScreen("game");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const exitGame = useCallback(() => {
    setScreen("home");
    setActiveScenario(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const finishGame = useCallback((turns: TurnRecord[]) => {
    setLastTurns(turns);
    setScreen("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const playAgain = useCallback(() => {
    if (!activeScenario) return;
    setLastTurns([]);
    setScreen("game");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeScenario]);

  const backToHome = useCallback(() => {
    setScreen("home");
    setActiveScenario(null);
    setSelectedId(null);
    setLastTurns([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const anotherScenario = useCallback(() => {
    setScreen("home");
    setActiveScenario(null);
    setLastTurns([]);
    scrollToScenarios();
  }, []);

  if (screen === "game" && activeScenario) {
    return (
      <div className="relative min-h-[100dvh]">
        <AnimatedBackdrop />
        <GameShell
          scenario={activeScenario}
          onExit={exitGame}
          onFinish={finishGame}
        />
      </div>
    );
  }

  if (screen === "result" && activeScenario) {
    return (
      <div className="relative min-h-[100dvh] px-3 py-10 sm:py-16">
        <AnimatedBackdrop />
        <ResultCard
          scenario={activeScenario}
          turns={lastTurns}
          onPlayAgain={playAgain}
          onPickScenario={anotherScenario}
        />
        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-zinc-500">
          <button
            type="button"
            onClick={backToHome}
            className="underline decoration-zinc-600 underline-offset-4 hover:text-zinc-300"
          >
            데모 홈으로
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh]">
      <AnimatedBackdrop />
      <ColdOpenDemo onPlayFullScenario={openImmigrationFull} />
      <ScenarioPreview
        scenarios={SCENARIOS}
        onPick={openScenario}
        activeId={selectedId}
      />
      <WhyDifferent />
      <section className="px-4 pb-24 pt-6 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-300/90">
            Final raid
          </p>
          <h3 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
            준비됐으면 아래 카드에서 시나리오 클릭
          </h3>
          <button
            type="button"
            onClick={scrollToScenarios}
            className="btn-neon-primary mt-6 w-full rounded-2xl py-4 text-sm font-black sm:text-base"
          >
            시나리오 그리드로 점프
          </button>
          <p className="mt-6 text-[11px] text-zinc-600">
            {GAME_DISPLAY_NAME} · hackathon MVP · 프론트만
          </p>
        </div>
      </section>
    </div>
  );
}
