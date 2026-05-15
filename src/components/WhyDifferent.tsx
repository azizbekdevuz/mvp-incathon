import { PANIC_QUIPS } from "@/lib/microcopy";

export function WhyDifferent() {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
          왜 재밌냐면요
        </h2>
        <p className="mt-2 text-base font-medium text-zinc-400">
          긴 블로그 안 씀. 그냥 밈 한 접시.
        </p>
        <ul className="mt-10 space-y-6">
          {PANIC_QUIPS.map((line) => (
            <li
              key={line}
              className="border-l-4 border-fuchsia-500 pl-4 text-lg font-bold leading-snug text-zinc-100 sm:text-xl"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
