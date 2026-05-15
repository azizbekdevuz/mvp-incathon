import { GAME_DISPLAY_NAME, GAME_TAGLINE_KO } from "@/lib/game-meta";

type HeroProps = {
  onStartPanic: () => void;
  onTryDemo: () => void;
};

export function Hero({ onStartPanic, onTryDemo }: HeroProps) {
  return (
    <section className="relative px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
      <div className="glass-panel mx-auto max-w-3xl px-6 py-10 text-center sm:px-10 sm:py-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
          Social sim · Konglish boss fights
        </p>
        <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
          {GAME_DISPLAY_NAME}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
          {GAME_TAGLINE_KO}
        </p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onStartPanic}
            className="btn-neon-primary rounded-2xl px-7 py-4 text-sm font-semibold sm:text-base"
          >
            Start Panic Mode
          </button>
          <button
            type="button"
            onClick={onTryDemo}
            className="btn-neon-ghost rounded-2xl px-7 py-4 text-sm font-semibold sm:text-base"
          >
            Try Demo Scenario
          </button>
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          미션: 원어민 NPC 감정 피해 살아남기 · 3라운드 · 로그인 없음
        </p>
      </div>
    </section>
  );
}
