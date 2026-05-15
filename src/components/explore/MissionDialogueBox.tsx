"use client";

import { motion } from "framer-motion";
import type { CampusMissionDef, MissionStagePresentation } from "@/data/campus-missions";

type MissionDialogueBoxProps = {
  mission: CampusMissionDef;
  stage: MissionStagePresentation;
  visible: boolean;
  reducedMotion: boolean;
};

function npcMark(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const bits = t.split(/\s+/).filter(Boolean);
  if (bits.length >= 2 && bits[0] && bits[1]) {
    const a = bits[0].replace(/[^A-Za-z가-힣]/g, "");
    const b = bits[1].replace(/[^A-Za-z가-힣]/g, "");
    const pair = `${a.slice(0, 1)}${b.slice(0, 1)}`.toUpperCase();
    if (pair.length >= 2) return pair.slice(0, 2);
  }
  return t.replace(/\s+/g, "").slice(0, 2).toUpperCase() || "?";
}

export function MissionDialogueBox({
  mission,
  stage,
  visible,
  reducedMotion,
}: MissionDialogueBoxProps) {
  return (
    <motion.div
      className="relative w-full max-w-lg"
      initial={false}
      animate={
        visible
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 12 }
      }
      transition={{
        duration: reducedMotion ? 0.12 : 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="pointer-events-none absolute -left-1 top-8 z-0 h-4 w-4 rotate-45 border-l border-t border-stone-400/35 bg-[#fffdf8]" />
      <div className="relative rounded-3xl border border-stone-400/35 bg-[#fffdf8]/[0.97] p-4 shadow-[0_20px_50px_-30px_rgba(62,54,46,0.45)] backdrop-blur-md">
        <div className="flex gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-200/90 via-amber-100/80 to-stone-100 ring-1 ring-stone-400/30 shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_55%)]" />
            <svg
              className="absolute inset-1 text-stone-600/35"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 4a4 4 0 0 1 4 4v1h1a2 2 0 0 1 2 2v7H7v-7a2 2 0 0 1 2-2h1V8a4 4 0 0 1 4-4z" />
            </svg>
            <span className="absolute bottom-1 right-1 rounded-md bg-white/85 px-1 text-[9px] font-black text-teal-900 shadow-sm">
              {npcMark(mission.npcName)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-900/75">
              {stage.npcRoleKo}
            </p>
            <p className="font-display text-lg font-bold leading-snug text-stone-900">
              {stage.stageTitleKo}
            </p>
            <p className="text-[11px] font-medium text-stone-500">{stage.stageSubtitleEn}</p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-stone-800">
              {stage.scenarioSetupKo}
            </p>
            <p className="mt-2 rounded-xl border border-stone-300/50 bg-white/70 px-3 py-2 text-xs font-medium italic text-stone-700">
              “{stage.challengeLineEn}”
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-50/90 px-2.5 py-1 text-[10px] font-semibold text-amber-950/90 ring-1 ring-amber-900/15">
                {stage.rewardTeaserKo}
              </span>
              <span className="rounded-full bg-teal-50/90 px-2.5 py-1 text-[10px] font-semibold text-teal-950/90 ring-1 ring-teal-900/15">
                스킬: {stage.skillLabel}
              </span>
              <span className="rounded-full bg-stone-100/90 px-2.5 py-1 text-[10px] font-medium text-stone-700 ring-1 ring-stone-400/25">
                {mission.npcName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
