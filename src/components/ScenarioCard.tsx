import type { Scenario } from "@/lib/types";
import { getScenarioTeaser } from "@/lib/scenario-teaser";

type ScenarioCardProps = {
  scenario: Scenario;
  onSelect: () => void;
  selected?: boolean;
};

export function ScenarioCard({
  scenario,
  onSelect,
  selected,
}: ScenarioCardProps) {
  const t = getScenarioTeaser(scenario);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "scenario-arcade group relative w-full overflow-hidden rounded-3xl border-2 border-white/10 bg-gradient-to-b from-zinc-900/95 to-black p-1 text-left shadow-[0_20px_50px_-28px_rgba(0,0,0,0.9)] transition-all duration-200 active:scale-[0.99] " +
        (selected
          ? "border-cyan-400/70 shadow-[0_0_32px_-6px_rgba(34,211,238,0.55)]"
          : "hover:border-fuchsia-500/35 hover:shadow-[0_0_40px_-10px_rgba(217,70,239,0.35)]")
      }
    >
      <div className="relative rounded-[1.25rem] bg-zinc-950/70 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="text-3xl drop-shadow-lg" aria-hidden>
              {scenario.scenarioEmoji}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black leading-tight text-white sm:text-xl">
                {scenario.titleKo}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-fuchsia-300/80">
                {scenario.titleEn}
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-lg bg-rose-600/90 px-2 py-1 text-center text-[10px] font-black leading-tight text-white shadow-lg">
            위험도
            <br />
            {scenario.awkwardness}
          </span>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            NPC 예시
          </p>
          <p className="mt-1 font-mono text-sm font-semibold leading-snug text-cyan-100">
            {t.npcLine}
          </p>
        </div>

        <div className="mt-3 rounded-2xl border border-rose-500/25 bg-rose-950/25 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-200/80">
            망한 답 예시
          </p>
          <p className="mt-1 text-sm font-bold text-rose-100">{t.badAnswer}</p>
          <p className="mt-2 inline-block rounded-md bg-black/40 px-2 py-1 text-[11px] font-bold text-amber-200">
            결과: {t.failSticker}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-bold text-violet-100">
            기대 스킬: {scenario.skillLabel}
          </span>
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-300">
            난이도 {scenario.difficulty}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-bold">
          <span className="text-fuchsia-300 transition group-hover:translate-x-0.5">
            탭하면 바로 개시
          </span>
          <span className="text-zinc-600">→</span>
        </div>
      </div>
    </button>
  );
}
