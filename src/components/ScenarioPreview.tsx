import type { Scenario } from "@/lib/types";
import { ScenarioCard } from "./ScenarioCard";

type ScenarioPreviewProps = {
  scenarios: Scenario[];
  onPick: (id: string) => void;
  activeId?: string | null;
};

export function ScenarioPreview({
  scenarios,
  onPick,
  activeId,
}: ScenarioPreviewProps) {
  return (
    <section id="scenarios" className="scroll-mt-20 bg-black/20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
          다른 지옥 고르기
        </h2>
        <p className="mt-2 text-sm font-medium text-zinc-400">
          각 3라운드 · 누르면 풀 채팅 매치로 이동
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              scenario={s}
              selected={activeId === s.id}
              onSelect={() => onPick(s.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
