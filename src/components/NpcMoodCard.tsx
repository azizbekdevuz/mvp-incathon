import type { ChoiceScores } from "@/lib/types";

export type NpcMood = "idle" | "suspicious" | "stress" | "glitch" | "respect";

const moodCopy: Record<
  NpcMood,
  { ko: string; bar: string; accent: string }
> = {
  idle: {
    ko: "대기 — 질문 중",
    bar: "bg-zinc-500",
    accent: "from-zinc-500 to-zinc-600",
  },
  suspicious: {
    ko: "표정: 이상한 냄새 남",
    bar: "bg-amber-500",
    accent: "from-amber-400 to-orange-600",
  },
  stress: {
    ko: "표정: 내부적으로 비상사태",
    bar: "bg-rose-500",
    accent: "from-rose-500 to-fuchsia-600",
  },
  glitch: {
    ko: "표정: 시스템 오류(당신 탓)",
    bar: "bg-violet-500",
    accent: "from-violet-500 to-cyan-500",
  },
  respect: {
    ko: "표정: 살짝 인정",
    bar: "bg-emerald-400",
    accent: "from-emerald-400 to-teal-500",
  },
};

export function moodFromScores(s: ChoiceScores): NpcMood {
  if (s.naturalness >= 88 && s.cringe < 22) return "respect";
  if (s.cringe >= 70) return "glitch";
  if (s.cringe >= 52 || s.naturalness < 35) return "stress";
  if (s.naturalness < 55 || s.cringe >= 40) return "suspicious";
  return "suspicious";
}

type NpcMoodCardProps = {
  mood: NpcMood;
  npcEmoji: string;
  npcName: string;
  moodMeter: number;
};

export function NpcMoodCard({
  mood,
  npcEmoji,
  npcName,
  moodMeter,
}: NpcMoodCardProps) {
  const meta = moodCopy[mood];
  const w = Math.min(100, Math.max(8, moodMeter));

  return (
    <div className="panic-npc-card flex items-center gap-3 rounded-2xl border border-white/15 bg-black/50 px-3 py-3 sm:gap-4 sm:px-4">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl sm:h-16 sm:w-16 ${meta.accent}`}
        aria-hidden
      >
        {npcEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{npcName}</p>
        <p className="text-xs text-zinc-400">{meta.ko}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${meta.bar}`}
            style={{ width: `${w}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-zinc-500">NPC 감정 게이지 · 아케이드 쇼케이스</p>
      </div>
    </div>
  );
}

export function npcMoodMeterValue(s: ChoiceScores): number {
  return Math.round(
    24 + s.cringe * 0.55 + (100 - s.naturalness) * 0.28 + (s.confidence < 40 ? 12 : 0),
  );
}
