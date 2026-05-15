"use client";

import type { CampusLandmark } from "@/data/campus-missions";

export type MissionMarkerVisualState =
  | "idle"
  | "hover"
  | "selected"
  | "cleared"
  | "suggested";

type MissionMarkerProps = {
  cx: number;
  cy: number;
  landmark: CampusLandmark;
  state: MissionMarkerVisualState;
  reducedMotion: boolean;
  /** One-shot ring when the player just selected this building (choreography). */
  selectionBurst?: boolean;
  /** Shown as compact ★ row when hover/selected (not when cleared). */
  panicLevel?: 1 | 2 | 3 | 4 | 5;
};

function pillText(lm: CampusLandmark) {
  const raw = lm.markerLabel ?? lm.shortLabel;
  return raw.length > 8 ? `${raw.slice(0, 8)}…` : raw;
}

function PanicMicro({ n }: { n: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <g transform="translate(0, 16)">
      {Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          cx={(i - 2) * 5}
          cy={0}
          r={1.6}
          fill={
            i < n ? "rgba(180, 83, 9, 0.75)" : "rgba(120, 113, 108, 0.22)"
          }
        />
      ))}
    </g>
  );
}

export function MissionMarker({
  cx,
  cy,
  landmark,
  state,
  reducedMotion,
  selectionBurst = false,
  panicLevel,
}: MissionMarkerProps) {
  const showPill = state === "hover" || state === "selected";
  const scale =
    state === "selected" ? 1.22 : state === "hover" ? 1.08 : 1;
  const ringStrong =
    state === "selected" || state === "suggested" || state === "hover";
  const showPanic =
    panicLevel != null && (state === "hover" || state === "selected");

  return (
    <g
      transform={`translate(${cx}, ${cy}) scale(${scale})`}
      className="pointer-events-none"
      aria-hidden
    >
      {selectionBurst && !reducedMotion ? (
        <circle r={8} fill="none" stroke="rgba(180, 83, 9, 0.45)" strokeWidth={2}>
          <animate
            attributeName="r"
            values="7;26;20"
            dur="0.72s"
            fill="freeze"
          />
          <animate
            attributeName="opacity"
            values="0.75;0;0"
            dur="0.72s"
            fill="freeze"
          />
        </circle>
      ) : null}
      {state === "suggested" ? (
        <circle
          r={20}
          fill="none"
          stroke="rgba(180, 83, 9, 0.22)"
          strokeWidth={1.2}
          opacity={0.55}
        >
          {!reducedMotion ? (
            <animate
              attributeName="opacity"
              values="0.35;0.75;0.35"
              dur="2.6s"
              repeatCount="indefinite"
            />
          ) : null}
        </circle>
      ) : null}

      <circle
        r={state === "cleared" ? 7.5 : 6}
        fill={
          state === "cleared"
            ? "rgba(250, 204, 21, 0.42)"
            : "rgba(255, 252, 245, 0.95)"
        }
        stroke={
          state === "cleared"
            ? "rgba(161, 98, 7, 0.55)"
            : "rgba(87, 83, 78, 0.45)"
        }
        strokeWidth={1.3}
      />
      <circle
        r={state === "cleared" ? 11.5 : 10}
        fill="none"
        stroke={
          ringStrong
            ? "rgba(180, 83, 9, 0.38)"
            : "rgba(120, 113, 108, 0.28)"
        }
        strokeWidth={state === "selected" ? 2.2 : 1.4}
      />

      {state === "cleared" ? (
        <g transform="translate(0, 0.5)">
          <circle r={8} fill="rgba(234, 179, 8, 0.2)" />
          <path
            d="M -3.5 0 L -1 2.5 L 3.5 -3"
            fill="none"
            stroke="rgba(120, 53, 15, 0.88)"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}

      {showPanic && panicLevel ? <PanicMicro n={panicLevel} /> : null}

      {showPill ? (
        <g transform="translate(0, -34)">
          <rect
            x={-52}
            y={-12}
            width={104}
            height={22}
            rx={11}
            fill="rgba(255, 253, 248, 0.96)"
            stroke="rgba(120, 113, 108, 0.35)"
            strokeWidth={1}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            fill="rgba(41, 37, 36, 0.9)"
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              fontFamily: "var(--font-sans), system-ui, sans-serif",
            }}
          >
            {pillText(landmark)}
          </text>
        </g>
      ) : null}
    </g>
  );
}

export function markerVisualState(
  lm: CampusLandmark,
  ctx: {
    selectedId: string | null;
    hoveredId: string | null;
    clearedIds: readonly string[];
    suggestedNextId: string | null;
  },
): MissionMarkerVisualState {
  if (ctx.clearedIds.includes(lm.id)) return "cleared";
  if (ctx.selectedId === lm.id) return "selected";
  if (ctx.hoveredId === lm.id) return "hover";
  if (ctx.suggestedNextId === lm.id) return "suggested";
  return "idle";
}
