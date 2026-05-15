import { SCENARIOS } from "@/data/scenarios";

export function DemoPreview() {
  const demo = SCENARIOS[0];
  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
          라이브 데모 프리뷰
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          아래는 체험 화면 구조 미리보기 — 실제는 채팅이 순서대로 쌓임.
        </p>
        <div className="mt-6 glass-panel overflow-hidden rounded-3xl">
          <div className="flex items-center gap-3 border-b border-white/10 bg-black/30 px-4 py-3">
            <span className="text-xl" aria-hidden>
              {demo.npcEmoji}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{demo.npcName}</p>
              <p className="text-xs text-zinc-400">{demo.titleKo}</p>
            </div>
            <span className="ml-auto rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-200">
              DEMO
            </span>
          </div>
          <div className="space-y-3 px-4 py-5">
            <div className="bubble-npc animate-chat-in rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-100">
              {demo.rounds[0].npcMessage}
            </div>
            <div className="bubble-you animate-chat-in rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-zinc-900">
              {demo.rounds[0].choices[2].text}
            </div>
            <div className="bubble-npc animate-chat-in rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-100">
              {demo.rounds[0].choices[2].reaction}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
