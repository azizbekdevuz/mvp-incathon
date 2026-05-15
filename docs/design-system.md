# Design system

This is a **code-backed** style guide: only patterns that exist in `src/app/globals.css` and components today.

## Visual identity

- **Dark-first:** `zinc-950` body background, light text (`zinc-50` family).  
- **Neon panic accents:** cyan + fuchsia gradients (`btn-neon-primary`, aurora backdrops).  
- **Glass surfaces:** `.glass-panel`, `.glass-panel-hover` — frosted panels with subtle border and blur.

The product should read as **night kiosk + Kakao meme energy**, not SaaS dashboard white space.

## Typography

| Role | Implementation |
|------|------------------|
| UI body | Default sans stack from layout: Geist Sans + Noto Sans KR fallbacks |
| Display / Korean headlines | `.font-display` → CSS variable `--font-display` (Noto-led) |
| Monospace accents | `font-mono` / `--font-geist-mono` for timers, transcripts, “system” vibes |

`layout.tsx` wires font CSS variables on `<body>`.

## Color usage (Tailwind-level)

Common tokens in components:

- **Cyan** (`cyan-200`–`cyan-400`) — “safe tech / listen / pass-adjacent”  
- **Fuchsia / purple** — panic, rank chips, speak category ACTIVE state  
- **Rose / amber** — cringe meters, fail reveals  
- **Emerald** — pass reveals, survival gauges  

Avoid introducing a **third** accent family (e.g., pure red brand + orange brand + separate green) without updating existing cards.

## Motion

Globals define:

- `konglish-aurora` — slow gradient drift for backgrounds  
- `float-label` + `@keyframes float-drift` — speak page floating English fragments  
- `reveal-open` / `reveal-pop` — result panels  
- `animate-pulse` on mic / listening hints (Tailwind built-in)

Keep animations **short** and **GPU-cheap** (opacity/transform). This repo does not ship `framer-motion`.

## Interaction philosophy

- **Big hit targets** on mobile (`min-h`, full-width buttons in speak mode).  
- **Press feedback:** `active:scale-[0.98]`, border brighten on hover for game cards.  
- **Honest disabled states** when SR missing — don’t fake a working mic icon.

## Korean youth UI inspiration (non-literal)

- Sticker-like chips (`rounded-full`, bold `text-[10px]` tracking labels).  
- “Broadcast” badges (`LIVE PANIC MODE`, timer chrome).  
- Dense but **readable** — avoid 10pt body copy; small labels are labels only.

## Game-like UX

- **Lives / streaks / meters** communicate state faster than paragraphs.  
- **NPC mood** copy in speak mode is a **label**, not an ML classifier output.  
- **Rank titles** in scenario mode come from authored `rankLadder` arrays — lean into specificity (“Refund Whisperer”) over generic “Level 12.”

## Adding new UI

1. Prefer reusing `glass-panel`, `bubble-npc`, `bubble-you`, `btn-neon-primary`, `btn-neon-ghost`.  
2. Add shared primitives to `globals.css` only when **three+** components need the same pattern.  
3. Keep contrast sufficient on `zinc-950` (WCAG AA is ideal for body text; labels may be more expressive).
