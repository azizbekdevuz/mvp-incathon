"use client";

export function AnimatedBackdrop() {
  const phrases = [
    { t: "문법보다 먼저 살아남자", x: "8%", d: "14s" },
    { t: "Konglish detected", x: "72%", d: "18s" },
    { t: "뜻은 전달… 분위기는 장례식", x: "18%", d: "22s" },
    { t: "Survival mode: ON", x: "55%", d: "16s" },
    { t: "polite enough?", x: "38%", d: "20s" },
    { t: "NPC typing…", x: "84%", d: "12s" },
    { t: "reply all trauma", x: "12%", d: "19s" },
    { t: "don’t say ‘too much sorry’", x: "64%", d: "21s" },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="konglish-aurora absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.14),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.1),transparent_50%)]" />
      {phrases.map((p, i) => (
        <span
          key={i}
          className="float-label text-[0.65rem] font-medium tracking-wide text-white/10 sm:text-xs"
          style={{
            left: p.x,
            top: `${12 + (i * 9) % 72}%`,
            animationDuration: p.d,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {p.t}
        </span>
      ))}
    </div>
  );
}
