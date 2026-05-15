# Contributing to mvp-incathon (Foreign NPC)

Thanks for helping. This repo is a **frontend-only hackathon MVP**: keep changes aligned with that scope unless maintainers explicitly expand it.

## Prerequisites

- **Node.js** compatible with Next.js 16  
- **pnpm** (`package.json` pins `packageManager`)  
- Familiarity with **React**, **TypeScript**, **App Router**, **Tailwind v4**

## Setup

```bash
pnpm install
pnpm dev
```

Before opening a PR:

```bash
pnpm lint
pnpm build
```

## Project philosophy

- **Ship honest UX** — the game sells awkward humor; the codebase should stay readable and truthful about what it does (no fake “AI backend” claims).  
- **Avoid unnecessary backend complexity** — new features should prefer static data, client state, and browser APIs unless there is a clear, agreed reason to add a server.  
- **Demo reliability** — if you change `GameShell` or speak mode, preserve or improve paths that work when the mic is denied or SR is missing.

## Branch naming

Use short, scoped prefixes:

- `feat/` — behavior users see (new scenario, new speak line, UI flow)  
- `fix/` — bug fixes  
- `docs/` — documentation only  
- `chore/` — tooling, config, formatting  

Example: `feat/speak-add-conbini-sentences`

## Commits

**Conventional Commits** are encouraged:

```
feat(speak): add retry hint when transcript empty
fix(game): reset manual modal state between rounds
docs: update gameplay for manual fallback
```

Subject ~72 chars, imperative mood, body optional for “why”.

## Pull requests

- One logical change per PR when possible.  
- Link related issues.  
- Describe **user-visible** impact (screenshots/GIF for UI).  
- Note if copy is **Korean-first** or affects `GAME_DISPLAY_NAME` / metadata.  
- Call out **browser** implications (especially Web Speech).

PR template: `.github/PULL_REQUEST_TEMPLATE.md`

## Code & UI standards

- Match existing patterns: `"use client"` only where needed, `@/` imports, Tailwind utility style used elsewhere.  
- **Do not** add secret-heavy `.env` examples without maintainer agreement; current app needs no env for core flows.  
- Keep **TypeScript strict** — avoid `any` unless justified and localized.  
- Reuse `glass-panel`, `btn-neon-primary`, `font-display` from `globals.css` when building surfaces so the product stays visually coherent.

## Adding scenario content

1. Open `src/data/scenarios.ts`.  
2. `Scenario` shape is defined in `src/lib/types.ts` (`id`, titles, `rounds` as **tuple of 3** `Round`, each with **3** `Choice`).  
3. Each `Choice` needs hand-tuned `scores`, `reaction`, `betterEnglish`, `nativeVersion`, `koreanExplanation`, optional `warning`.  
4. Add the scenario to `SCENARIOS` and wire selection in `ScenarioPreview` / `KonglishExperience` (IDs are string-matched from data).

Keep tone consistent with existing NPC voice: specific, funny, not cruel to real-world groups.

## Adding speak challenges

1. Open `src/data/speaking-challenges.ts`.  
2. Append to `SPEAKING_CATEGORIES` or extend an existing category’s `sentences` array.  
3. Each sentence needs the fields already used in the type (`id`, `sentence`, hints, reactions, `nativeTip`, `dangerLevel`, `funnyTag`).  
4. If you change difficulty of recognition, tune `src/lib/speech-scoring.ts` (`SPEECH_PASS_THRESHOLD` and weighting) with a short comment **why**.

## What we are unlikely to merge without discussion

- Auth, user accounts, databases, or paid third-party APIs “because production”  
- Large refactors that mix with unrelated feature work  
- Generated scenario dumps without editorial pass for tone and scoring consistency

## Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be direct in technical feedback; don’t confuse “roast the Konglish line” with roasting a person.
