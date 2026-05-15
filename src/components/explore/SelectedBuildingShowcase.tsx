"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CampusLandmark } from "@/data/campus-missions";

type SelectedBuildingShowcaseProps = {
  landmark: CampusLandmark;
  visible: boolean;
  reducedMotion: boolean;
};

export function SelectedBuildingShowcase({
  landmark,
  visible,
  reducedMotion,
}: SelectedBuildingShowcaseProps) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[min(100%,320px)] sm:max-w-[340px]"
      initial={false}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 18, scale: 0.96 }
      }
      transition={{
        duration: reducedMotion ? 0.12 : 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/15 bg-gradient-to-b from-[#fffdf8] to-[#f3ebe0] p-2 shadow-[0_28px_60px_-28px_rgba(62,54,46,0.55)] ring-1 ring-stone-400/20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.55),transparent_55%)]" />
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-200/40">
          <Image
            src={landmark.heroArtSrc}
            alt={landmark.nameKo}
            width={480}
            height={600}
            className="h-full w-full object-cover object-center"
            sizes="(max-width:768px) 72vw, 340px"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/25 via-transparent to-transparent" />
        </div>
        {!reducedMotion ? (
          <motion.div
            className="pointer-events-none absolute -bottom-1 left-1/2 h-6 w-[72%] -translate-x-1/2 rounded-full bg-stone-900/18 blur-md"
            animate={{ opacity: [0.35, 0.55, 0.35], scaleX: [0.92, 1, 0.92] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
      </div>
    </motion.div>
  );
}
