"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CampusLandmark } from "@/data/campus-missions";
import {
  CAMPUS_MAP_VIEWBOX,
  getCampusMission,
  getLandmarkById,
  landmarkBubblePct,
  landmarkCenterSvg,
  nextRouteGlowD,
  overworldPolylineD,
} from "@/data/campus-missions";
import { BuildingSpotlight } from "./BuildingSpotlight";
import { MissionMarker, markerVisualState } from "./MissionMarker";

type WatercolorCampusWorldProps = {
  landmarks: CampusLandmark[];
  selectedId: string | null;
  hoveredId: string | null;
  clearedIds: string[];
  /** Next stop on suggested route — extra pin emphasis */
  suggestedNextId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  reducedMotion: boolean;
  mapInteractive: boolean;
};

const VB = CAMPUS_MAP_VIEWBOX;
/** Approx. central plaza / spine — “path lights toward heart” on hover */
const SPINE = { x: 0.47 * VB.w, y: 0.58 * VB.h };

function hotspotRect(lm: CampusLandmark) {
  const { nx, ny, nw, nh } = lm.hotspotNorm;
  return {
    x: nx * VB.w,
    y: ny * VB.h,
    w: nw * VB.w,
    h: nh * VB.h,
  };
}

function pulseCenter(lm: CampusLandmark) {
  const { x, y, w, h } = hotspotRect(lm);
  return { cx: x + w / 2, cy: y + h / 2 };
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function WatercolorCampusWorld({
  landmarks,
  selectedId,
  hoveredId,
  clearedIds,
  suggestedNextId,
  onHover,
  onSelect,
  reducedMotion,
  mapInteractive,
}: WatercolorCampusWorldProps) {
  const sysReduce = useReducedMotion();
  const noMotion = reducedMotion || sysReduce;
  const stageRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const selectedLm = useMemo(
    () => (selectedId ? getLandmarkById(selectedId) : undefined),
    [selectedId],
  );

  const hoverLm = useMemo(
    () => (hoveredId ? getLandmarkById(hoveredId) : undefined),
    [hoveredId],
  );

  const fullRouteD = useMemo(
    () => overworldPolylineD(landmarks),
    [landmarks],
  );

  const glowSegD = useMemo(
    () => nextRouteGlowD(landmarks, clearedIds),
    [landmarks, clearedIds],
  );

  const cameraOrigin = useMemo(() => {
    if (selectedLm) {
      const { nx, ny, nw, nh } = selectedLm.hotspotNorm;
      return {
        x: (nx + nw / 2) * 100,
        y: (ny + nh / 2) * 100,
      };
    }
    return { x: 48, y: 54 };
  }, [selectedLm]);

  const [selectionBurstId, setSelectionBurstId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId || noMotion) {
      const clear = window.setTimeout(() => setSelectionBurstId(null), 0);
      return () => window.clearTimeout(clear);
    }
    const arm = window.setTimeout(() => setSelectionBurstId(selectedId), 0);
    const disarm = window.setTimeout(() => setSelectionBurstId(null), 760);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(disarm);
    };
  }, [selectedId, noMotion]);

  const selectedSpineD = useMemo(() => {
    if (!selectedLm || !mapInteractive) return null;
    const { x, y } = landmarkCenterSvg(selectedLm);
    return `M ${SPINE.x.toFixed(1)} ${SPINE.y.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, [selectedLm, mapInteractive]);

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (noMotion || !mapInteractive || selectedId) return;
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      setParallax({
        x: clamp(mx * 14, -10, 10),
        y: clamp(my * 14, -10, 10),
      });
    },
    [mapInteractive, noMotion, selectedId],
  );

  const resetParallax = useCallback(() => {
    setParallax({ x: 0, y: 0 });
  }, []);

  const onHotspotKey =
    (id: string) => (e: KeyboardEvent<SVGRectElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(id);
      }
    };

  const spineHoverD = useMemo(() => {
    if (!hoverLm || selectedId || !mapInteractive) return null;
    const { x, y } = landmarkCenterSvg(hoverLm);
    return `M ${x.toFixed(1)} ${y.toFixed(1)} L ${SPINE.x.toFixed(1)} ${SPINE.y.toFixed(1)}`;
  }, [hoverLm, mapInteractive, selectedId]);

  return (
    <div
      ref={stageRef}
      className="relative w-full overflow-hidden rounded-2xl shadow-[0_28px_90px_-36px_rgba(62,54,46,0.5)] ring-1 ring-stone-400/30"
      onPointerMove={onPointerMove}
      onPointerLeave={resetParallax}
    >
      <motion.div
        className="relative w-full origin-center will-change-transform"
        style={{
          transformOrigin: `${cameraOrigin.x}% ${cameraOrigin.y}%`,
        }}
        animate={{
          scale: selectedId ? 1.07 : noMotion ? 1 : [1, 1.0028, 1],
          x: parallax.x,
          y: parallax.y,
        }}
        transition={
          selectedId
            ? { type: "spring", stiffness: 140, damping: 22, mass: 0.85 }
            : {
                scale: {
                  duration: 16,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                x: { type: "spring", stiffness: 180, damping: 26 },
                y: { type: "spring", stiffness: 180, damping: 26 },
              }
        }
      >
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            className={[
              "block h-auto w-full touch-pan-x select-none",
              mapInteractive ? "cursor-crosshair sm:cursor-grab active:sm:cursor-grabbing" : "",
            ].join(" ")}
            role="img"
            aria-label="세종대 수채화 캠퍼스 지도"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="hotspotHover" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#fffdf5" stopOpacity="0" />
              </radialGradient>
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <image
              href="/assets/map_bg.png"
              width={VB.w}
              height={VB.h}
              preserveAspectRatio="xMidYMid meet"
            />

            {/* Full suggested route — whisper */}
            <path
              d={fullRouteD}
              fill="none"
              stroke="rgba(146, 124, 92, 0.14)"
              strokeWidth={11}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />

            {/* Active “go here next” segment */}
            {glowSegD ? (
              <path
                d={glowSegD}
                fill="none"
                stroke="rgba(176, 125, 55, 0.42)"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray="7 11"
                filter="url(#routeGlow)"
                pointerEvents="none"
              >
                {!noMotion ? (
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-36;0"
                    dur="4.2s"
                    repeatCount="indefinite"
                  />
                ) : null}
              </path>
            ) : null}

            {/* Focus path: plaza spine → selected building */}
            {selectedSpineD ? (
              <path
                d={selectedSpineD}
                fill="none"
                stroke="rgba(255, 253, 245, 0.26)"
                strokeWidth={5}
                strokeLinecap="round"
                filter="url(#routeGlow)"
                pointerEvents="none"
              />
            ) : null}

            {/* Soft path toward campus spine on hover */}
            {spineHoverD ? (
              <path
                d={spineHoverD}
                fill="none"
                stroke="rgba(255, 253, 245, 0.14)"
                strokeWidth={22}
                strokeLinecap="round"
                pointerEvents="none"
              />
            ) : null}

            {selectedLm && mapInteractive ? (
              <BuildingSpotlight
                landmark={selectedLm}
                reducedMotion={Boolean(noMotion)}
              />
            ) : null}

            {landmarks.map((lm) => {
              const { x, y, w, h } = hotspotRect(lm);
              const { cx, cy } = pulseCenter(lm);
              const hot = hoveredId === lm.id || selectedId === lm.id;
              const mState = markerVisualState(lm, {
                selectedId,
                hoveredId,
                clearedIds,
                suggestedNextId,
              });
              const mission = getCampusMission(lm.missionId);
              return (
                <g key={lm.id}>
                  <MissionMarker
                    cx={cx}
                    cy={cy}
                    landmark={lm}
                    state={mState}
                    reducedMotion={Boolean(noMotion)}
                    selectionBurst={selectionBurstId === lm.id}
                    panicLevel={mission?.panicLevel}
                  />
                  {hot && mapInteractive ? (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={w * 0.52}
                      ry={h * 0.52}
                      fill="url(#hotspotHover)"
                      pointerEvents="none"
                    />
                  ) : null}
                  <rect
                    data-landmark-hit={lm.id}
                    data-sound-hover="mission-hotspot"
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill="transparent"
                    className={
                      mapInteractive
                        ? "cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800/45"
                        : "pointer-events-none"
                    }
                    role="button"
                    tabIndex={mapInteractive ? 0 : -1}
                    aria-label={`${lm.nameKo} — ${lm.nameEn} 미션`}
                    onMouseEnter={() => mapInteractive && onHover(lm.id)}
                    onMouseLeave={() => mapInteractive && onHover(null)}
                    onFocus={() => mapInteractive && onHover(lm.id)}
                    onBlur={() => mapInteractive && onHover(null)}
                    onClick={() => mapInteractive && onSelect(lm.id)}
                    onKeyDown={mapInteractive ? onHotspotKey(lm.id) : undefined}
                  />
                </g>
              );
            })}
          </svg>

          {/* Atmosphere layers */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_18%,rgba(255,250,235,0.09),transparent_52%)]" />
            {!noMotion ? (
              <motion.div
                className="absolute -left-[18%] top-[8%] h-[48%] w-[58%] rounded-full bg-stone-900/[0.06] blur-3xl"
                animate={{ x: [0, 36, 0], y: [0, 10, 0], opacity: [0.4, 0.62, 0.4] }}
                transition={{
                  duration: 32,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}
            {!noMotion ? (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-amber-50/[0.06] via-transparent to-teal-900/[0.06]"
                animate={{ opacity: [0.45, 0.8, 0.45] }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-stone-900/[0.07] via-transparent to-amber-50/[0.04]"
              animate={
                noMotion
                  ? { opacity: 0.45 }
                  : { opacity: [0.35, 0.55, 0.35] }
              }
              transition={
                noMotion
                  ? { duration: 0 }
                  : {
                      duration: 20,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
              }
            />
          </div>

          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl bg-stone-950/0"
            animate={{
              backgroundColor:
                selectedId && mapInteractive
                  ? "rgba(22, 19, 17, 0.34)"
                  : "rgba(22, 19, 17, 0)",
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />

          {/* Hover NPC line — game tooltip */}
          {hoverLm && mapInteractive && !selectedId ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={hoverLm.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="pointer-events-none absolute z-[5] max-w-[min(260px,46vw)]"
                style={{
                  left: `${landmarkBubblePct(hoverLm).left}%`,
                  top: `${landmarkBubblePct(hoverLm).top}%`,
                  transform: "translate(-50%, calc(-100% - 14px))",
                }}
              >
              <div className="relative rounded-2xl border border-amber-900/12 bg-[#fffdf8]/95 px-3.5 py-2.5 text-[11px] font-medium leading-snug text-stone-700 shadow-[0_12px_40px_-20px_rgba(62,54,46,0.45)] backdrop-blur-md">
                <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-amber-900/12 bg-[#fffdf8]" />
                <p className="text-[10px] font-semibold tracking-wide text-teal-900/85">
                  {hoverLm.shortLabel}
                  {hoverLm.id === suggestedNextId ? (
                    <span className="ml-1.5 rounded-full bg-amber-100/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-950/90">
                      추천
                    </span>
                  ) : null}
                </p>
                <p className="relative z-[1] mt-1 text-stone-600">{hoverLm.npcTease}</p>
              </div>
              </motion.div>
            </AnimatePresence>
          ) : null}

        </div>
      </motion.div>
    </div>
  );
}
