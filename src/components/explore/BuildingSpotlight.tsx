"use client";

import type { CampusLandmark } from "@/data/campus-missions";
import { CAMPUS_MAP_VIEWBOX } from "@/data/campus-missions";

const VB = CAMPUS_MAP_VIEWBOX;

type BuildingSpotlightProps = {
  landmark: CampusLandmark;
  reducedMotion: boolean;
};

/** Soft stage light on the selected hotspot — stays inside the map SVG. */
export function BuildingSpotlight({
  landmark,
  reducedMotion,
}: BuildingSpotlightProps) {
  const { nx, ny, nw, nh } = landmark.hotspotNorm;
  const cx = (nx + nw / 2) * VB.w;
  const cy = (ny + nh / 2) * VB.h;
  const rx = Math.max(nw * VB.w * 0.62, 72);
  const ry = Math.max(nh * VB.h * 0.58, 56);

  return (
    <g pointerEvents="none" aria-hidden>
      <defs>
        <radialGradient id="exploreBuildingSpot" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#fffdf5" stopOpacity="0.26" />
          <stop offset="55%" stopColor="#fef3c7" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fffdf5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="url(#exploreBuildingSpot)"
      >
        {!reducedMotion ? (
          <animate
            attributeName="opacity"
            values="0.85;1;0.88"
            dur="2.4s"
            repeatCount="indefinite"
          />
        ) : null}
      </ellipse>
    </g>
  );
}
