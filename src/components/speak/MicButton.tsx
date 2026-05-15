"use client";

type MicButtonProps = {
  isListening: boolean;
  disabled: boolean;
  onClick: () => void;
  supported: boolean;
};

export function MicButton({
  isListening,
  disabled,
  onClick,
  supported,
}: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !supported}
        className={[
          "relative flex h-28 w-28 items-center justify-center rounded-full border-4 font-display text-sm font-black transition-all sm:h-32 sm:w-32",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400",
          !supported
            ? "cursor-not-allowed border-zinc-700 bg-zinc-800 text-zinc-500"
            : isListening
              ? "border-cyan-300 bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-black shadow-[0_0_48px_-6px_rgba(34,211,238,0.75)] animate-pulse"
              : "border-fuchsia-400/60 bg-gradient-to-br from-zinc-800 to-zinc-950 text-white hover:scale-105 hover:border-cyan-300 hover:shadow-[0_0_36px_-8px_rgba(236,72,153,0.55)] active:scale-95",
          disabled && supported ? "opacity-60" : "",
        ].join(" ")}
        aria-pressed={isListening}
      >
        <span className="text-4xl sm:text-5xl" aria-hidden>
          🎤
        </span>
        {isListening ? (
          <span className="absolute inset-0 rounded-full border-4 border-cyan-300/50 animate-[ping_1.2s_ease-in-out_infinite]" />
        ) : null}
      </button>
      <p className="text-center text-xs font-bold text-zinc-300">
        {supported ? "Try Speaking · 읽기 시작" : "이 브라우저는 음성인식 제한"}
      </p>
    </div>
  );
}
