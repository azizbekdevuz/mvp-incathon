"use client";

type PanicMeterProps = {
  value: number;
  label?: string;
};

export function PanicMeter({ value, label = "크링지 / 패닉" }: PanicMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-wide text-rose-100">
          {label}
        </p>
        <span className="rounded-full bg-black/40 px-2 py-0.5 font-mono text-xs font-bold text-rose-200">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="mt-3 h-4 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-fuchsia-500 transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] text-zinc-500">
        실패할수록 NPC 정신이 흔들림
      </p>
    </div>
  );
}
