"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { CampusLandmark, CampusMissionDef } from "@/data/campus-missions";
import { missionStagePresentation } from "@/data/campus-missions";
import { MissionDialogueBox } from "./MissionDialogueBox";
import { MissionPlayFlow } from "./MissionPlayFlow";
import { SelectedBuildingShowcase } from "./SelectedBuildingShowcase";

type EntryPhase = "idle" | "dim" | "art" | "dialogue" | "cta";

type MissionEntryOverlayProps = {
  landmark: CampusLandmark;
  mission: CampusMissionDef;
  cleared: boolean;
  reducedMotion: boolean;
  onClose: () => void;
  onClearLandmark: (landmarkId: string) => void;
};

export function MissionEntryOverlay({
  landmark,
  mission,
  cleared,
  reducedMotion,
  onClose,
  onClearLandmark,
}: MissionEntryOverlayProps) {
  const stage = useMemo(() => missionStagePresentation(mission), [mission]);
  const [mode, setMode] = useState<"entry" | "play">("entry");
  const [entryPhase, setEntryPhase] = useState<EntryPhase>("idle");

  useEffect(() => {
    if (mode !== "entry") return;
    if (reducedMotion) {
      const t = window.setTimeout(() => setEntryPhase("cta"), 0);
      return () => window.clearTimeout(t);
    }
    const t0 = window.setTimeout(() => setEntryPhase("dim"), 40);
    const t1 = window.setTimeout(() => setEntryPhase("art"), 180);
    const t2 = window.setTimeout(() => setEntryPhase("dialogue"), 440);
    const t3 = window.setTimeout(() => setEntryPhase("cta"), 720);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [landmark.id, mission.id, mode, reducedMotion]);

  const dimOn = entryPhase !== "idle" && mode === "entry";
  const showArt = entryPhase === "art" || entryPhase === "dialogue" || entryPhase === "cta";
  const showDialogue =
    entryPhase === "dialogue" || entryPhase === "cta" || mode === "play";
  const showCta = (entryPhase === "cta" && mode === "entry") || reducedMotion;

  return (
    <motion.div
      className="fixed inset-0 z-[85] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
    >
      <button
        type="button"
        aria-label="지도로 돌아가기"
        className={[
          "absolute inset-0 transition-colors duration-500",
          dimOn ? "bg-stone-950/72 backdrop-blur-[2px]" : "bg-stone-950/0",
        ].join(" ")}
        onClick={onClose}
      />

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col justify-end overflow-y-auto p-0 sm:justify-center sm:p-8 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait">
          {mode === "entry" ? (
            <motion.div
              key="entry"
              className="mx-auto flex w-full max-w-5xl flex-col gap-5 rounded-t-[1.85rem] border-t border-stone-400/35 bg-[#faf6ef]/[0.97] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-28px_90px_-36px_rgba(0,0,0,0.42)] backdrop-blur-md sm:flex-row sm:items-stretch sm:gap-10 sm:rounded-none sm:border-none sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-1 flex-col items-center sm:w-[42%]">
                <SelectedBuildingShowcase
                  landmark={landmark}
                  visible={showArt}
                  reducedMotion={reducedMotion}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-4 sm:w-[58%]">
                <MissionDialogueBox
                  mission={mission}
                  stage={stage}
                  visible={showDialogue}
                  reducedMotion={reducedMotion}
                />

                {showCta ? (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <button
                      type="button"
                      onClick={() => setMode("play")}
                      className="w-full rounded-2xl bg-gradient-to-r from-teal-800 to-teal-900 py-4 text-sm font-bold tracking-wide text-amber-50 shadow-lg transition hover:from-teal-700 hover:to-teal-800 sm:w-auto sm:min-w-[200px] sm:px-10"
                    >
                      레벨 시작
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full rounded-2xl border border-stone-400/40 bg-white/70 py-3 text-sm font-semibold text-stone-700 hover:bg-white sm:w-auto sm:px-6"
                    >
                      지도로
                    </button>
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="play"
              className="mx-auto mt-auto w-full max-w-lg rounded-t-[1.85rem] border border-b-0 border-stone-400/35 bg-[#fffdf8]/[0.98] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-20px_70px_-28px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:mt-0 sm:rounded-[1.75rem] sm:border sm:border-stone-400/30 sm:shadow-[0_32px_100px_-40px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
            >
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-stone-300/40 pb-3">
                <p className="font-display text-sm font-bold text-stone-900">
                  {landmark.nameKo}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-stone-400/35 bg-white/70 px-3 py-1 text-xs font-semibold text-stone-600"
                >
                  닫기
                </button>
              </div>
              <MissionPlayFlow
                landmark={landmark}
                mission={mission}
                cleared={cleared}
                autoBegin={!cleared}
                onClose={onClose}
                onClearLandmark={onClearLandmark}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
