import type { Choice } from "@/lib/types";

type FeedbackCardProps = {
  choice: Choice;
};

export function FeedbackCard({ choice }: FeedbackCardProps) {
  return (
    <div className="glass-panel mt-3 rounded-2xl border border-cyan-500/20 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
        피드백 패킷
      </p>
      <dl className="mt-3 space-y-3">
        <div>
          <dt className="text-[11px] font-medium text-zinc-500">You / Konglish</dt>
          <dd className="mt-1 text-zinc-100">{choice.text}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium text-zinc-500">Better English</dt>
          <dd className="mt-1 text-emerald-200">{choice.betterEnglish}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium text-zinc-500">Native vibe</dt>
          <dd className="mt-1 text-white">{choice.nativeVersion}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium text-zinc-500">한국어 설명</dt>
          <dd className="mt-1 leading-relaxed text-zinc-300">
            {choice.koreanExplanation}
          </dd>
        </div>
        {choice.warning ? (
          <div className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            <span className="font-semibold">Don’t say this: </span>
            {choice.warning}
          </div>
        ) : null}
      </dl>
    </div>
  );
}
