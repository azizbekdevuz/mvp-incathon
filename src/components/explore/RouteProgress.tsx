"use client";

import {
  OVERWORLD_MISSION_PATH,
  overworldClearedStreak,
} from "@/data/campus-missions";

type RouteProgressProps = {
  clearedIds: readonly string[];
  className?: string;
};

/** Stage dots along the recommended campus route. */
export function RouteProgress({ clearedIds, className }: RouteProgressProps) {
  const streak = overworldClearedStreak(clearedIds);
  const routeLen = OVERWORLD_MISSION_PATH.length;

  return (
    <div
      className={["flex items-center gap-1", className ?? ""].join(" ")}
      role="progressbar"
      aria-valuenow={streak}
      aria-valuemin={0}
      aria-valuemax={routeLen}
      aria-label={`추천 루트 연속 클리어 ${streak} / ${routeLen}`}
    >
      <span className="text-[8px] font-bold uppercase tracking-wide text-stone-500/90">
        루트
      </span>
      {OVERWORLD_MISSION_PATH.map((id, i) => (
        <span
          key={id}
          className={[
            "h-1.5 w-1.5 rounded-full ring-1 transition-colors",
            i < streak
              ? "bg-amber-400/95 ring-amber-800/25"
              : i === streak
                ? "bg-teal-500/90 ring-teal-900/30"
                : "bg-stone-300/90 ring-stone-500/25",
          ].join(" ")}
          title={id}
        />
      ))}
    </div>
  );
}
