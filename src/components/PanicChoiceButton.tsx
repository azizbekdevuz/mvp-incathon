import type { ReactNode } from "react";

export type PanicRisk = "bad" | "risky" | "natural";

const ring: Record<PanicRisk, string> = {
  bad: "ring-rose-500/60 hover:ring-rose-400/80 shadow-[0_0_0_1px_rgba(244,63,94,0.35)]",
  risky: "ring-amber-400/55 hover:ring-amber-300/75 shadow-[0_0_0_1px_rgba(251,191,36,0.35)]",
  natural: "ring-emerald-400/50 hover:ring-emerald-300/70 shadow-[0_0_0_1px_rgba(52,211,153,0.35)]",
};

const bg: Record<PanicRisk, string> = {
  bad: "from-rose-950/90 via-zinc-900/95 to-zinc-950",
  risky: "from-amber-950/80 via-zinc-900/95 to-zinc-950",
  natural: "from-emerald-950/75 via-zinc-900/95 to-zinc-950",
};

const label: Record<PanicRisk, string> = {
  bad: "위험 · 교과서/Konglish",
  risky: "애매 · 살아남기",
  natural: "안전권 · 네이티브",
};

type PanicChoiceButtonProps = {
  risk: PanicRisk;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

export function PanicChoiceButton({
  risk,
  children,
  onClick,
  disabled,
}: PanicChoiceButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`panic-choice group relative w-full rounded-2xl bg-gradient-to-br ${bg[risk]} px-4 py-4 text-left ring-2 transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 hover:brightness-110 sm:py-5 ${ring[risk]}`}
    >
      <span
        className={`mb-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
          risk === "bad"
            ? "bg-rose-500/25 text-rose-200"
            : risk === "risky"
              ? "bg-amber-400/20 text-amber-100"
              : "bg-emerald-400/20 text-emerald-100"
        }`}
      >
        {label[risk]}
      </span>
      <span className="block text-base font-bold leading-snug text-white sm:text-lg">
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-3 right-3 text-[11px] font-semibold text-white/40 transition group-hover:text-white/70">
        탭!
      </span>
    </button>
  );
}
