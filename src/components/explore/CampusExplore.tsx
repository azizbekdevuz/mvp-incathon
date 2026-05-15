"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  CAMPUS_LANDMARKS,
  campusRankTitle,
  getLandmarkById,
  getCampusMission,
  nextMissionLandmarkId,
} from "@/data/campus-missions";
import { CampusHud } from "./CampusHud";
import { MissionEntryOverlay } from "./MissionEntryOverlay";
import { WatercolorCampusWorld } from "./WatercolorCampusWorld";

const LS_KEY = "sejong-explore-cleared-v1";

function subscribeMotion(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function CampusExplore() {
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [gateShow, setGateShow] = useState(true);
  const [introDone, setIntroDone] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- one-shot localStorage hydrate */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          const next = parsed.filter((x) => typeof x === "string");
          setClearedIds(next);
        }
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(clearedIds));
    } catch {
      /* ignore */
    }
  }, [clearedIds, hydrated]);

  useEffect(() => {
    if (reducedMotion) {
      const skip = window.setTimeout(() => {
        setGateShow(false);
        setIntroDone(true);
      }, 0);
      return () => window.clearTimeout(skip);
    }
    const id = window.setTimeout(() => setGateShow(false), 1100);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedLandmark = useMemo(
    () => (selectedId ? getLandmarkById(selectedId) : undefined),
    [selectedId],
  );

  const mission = useMemo(
    () =>
      selectedLandmark
        ? getCampusMission(selectedLandmark.missionId)
        : undefined,
    [selectedLandmark],
  );

  const onClearLandmark = useCallback((id: string) => {
    setClearedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const total = CAMPUS_LANDMARKS.length;
  const rank = campusRankTitle(clearedIds.length, total);
  const mapInteractive = introDone;

  const suggestedNextId = useMemo(
    () => nextMissionLandmarkId(clearedIds),
    [clearedIds],
  );

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#e8e2d6] text-stone-800">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E")`,
        }}
      />

      <CampusHud
        rankLabel={rank}
        cleared={clearedIds.length}
        total={total}
        clearedIds={clearedIds}
        suggestedNextId={suggestedNextId}
      />

      <main className="relative z-[10] flex min-h-[100dvh] flex-1 flex-col pt-[5.75rem]">
        <motion.div
          className="relative flex min-h-0 flex-1 flex-col px-2 pb-3 pt-1 sm:px-4 sm:pb-4 sm:pt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.85, ease: "easeOut" }}
        >
          <div className="relative z-[1] flex min-h-0 flex-1 sm:min-h-[56vh]">
            <WatercolorCampusWorld
              landmarks={CAMPUS_LANDMARKS}
              selectedId={selectedId}
              hoveredId={hoveredId}
              clearedIds={clearedIds}
              suggestedNextId={suggestedNextId}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              reducedMotion={reducedMotion}
              mapInteractive={mapInteractive}
            />
          </div>
        </motion.div>

        <AnimatePresence onExitComplete={() => setIntroDone(true)}>
          {gateShow ? (
            <motion.div
              key="gate-intro"
              className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#ebe4d8] px-6"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="relative max-h-[min(72vh,640px)] w-full max-w-lg"
              >
                <Image
                  src="/assets/main_gate.png"
                  alt="세종대 정문"
                  width={800}
                  height={640}
                  className="h-auto w-full object-contain drop-shadow-xl"
                  priority
                  sizes="(max-width:768px) 90vw, 512px"
                />
                <p className="mt-6 text-center text-sm font-medium text-stone-600">
                  캠퍼스로 들어가는 중…
                </p>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selectedLandmark && mission ? (
            <MissionEntryOverlay
              key={selectedLandmark.id}
              landmark={selectedLandmark}
              mission={mission}
              cleared={clearedIds.includes(selectedLandmark.id)}
              reducedMotion={reducedMotion}
              onClose={() => setSelectedId(null)}
              onClearLandmark={onClearLandmark}
            />
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
