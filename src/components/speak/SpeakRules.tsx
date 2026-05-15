export function SpeakRules() {
  return (
    <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-r from-fuchsia-950/40 via-zinc-900/60 to-cyan-950/40 px-4 py-3 text-center">
      <p className="font-display text-xs font-black tracking-wide text-fuchsia-100 sm:text-sm">
        1. 문장 선택 → 2. 읽기 → 3. NPC 판정 → 4. 살아남기
      </p>
      <p className="mt-1 text-[11px] font-medium text-zinc-400">
        영어 문장 읽기 게임인데, 못 읽으면 NPC가 바로 긁음.
      </p>
    </div>
  );
}
