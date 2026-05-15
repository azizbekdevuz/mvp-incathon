"use client";

import type { SpeakingCategory } from "@/data/speaking-challenges";

type CategoryRailProps = {
  categories: SpeakingCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function CategoryRail({
  categories,
  selectedId,
  onSelect,
}: CategoryRailProps) {
  return (
    <div className="w-full">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
        카테고리 · 월드 선택
      </p>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const active = c.id === selectedId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "group relative min-w-[11.5rem] max-w-[13rem] shrink-0 snap-start rounded-2xl border-2 px-4 py-3 text-left transition-all duration-200",
                "hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]",
                active
                  ? "border-cyan-400 bg-gradient-to-br from-cyan-500/25 via-fuchsia-600/20 to-amber-500/15 shadow-[0_0_28px_-6px_rgba(34,211,238,0.55)]"
                  : "border-white/10 bg-zinc-900/80 hover:border-fuchsia-400/40",
              ].join(" ")}
            >
              <span className="text-2xl leading-none">{c.emoji}</span>
              <p className="font-display mt-1 text-sm font-black text-white">
                {c.titleKo}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {c.titleEn}
              </p>
              <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-zinc-400">
                {c.descriptionKo}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="rounded-md bg-black/35 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                  난이도 {c.difficulty}
                </span>
                <span className="rounded-md bg-fuchsia-500/20 px-1.5 py-0.5 text-[10px] font-bold text-fuchsia-100">
                  {c.vibe}
                </span>
              </div>
              {active ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-cyan-400 px-2 py-0.5 text-[9px] font-black text-black shadow">
                  LIVE
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
