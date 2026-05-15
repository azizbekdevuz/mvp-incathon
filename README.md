# Foreign NPC

**Konglish survival sim — mess up, NPC emotes in real time.**

Frontend-only MVP: two playable modes on one Next.js app — a **3-round choice-driven English survival game** with scripted NPC reactions, and a separate **browser speech challenge** (“말하면 산다”) that scores spoken English against target lines using fuzzy text similarity. No backend, no database, no auth, no paid speech APIs.

---

## Preview

Screenshots are not checked into the repo yet. Add under `docs/assets/` when you have them.

| Area | Placeholder |
|------|-------------|
| Home / cold open | ![Home: cold open demo and CTA to full scenarios](docs/assets/README-home.png) |
| Full scenario (3 rounds) | ![In-game: NPC message and three Konglish-ish choices](docs/assets/README-game.png) |
| Result / rank | ![Result card with rank ladder and totals](docs/assets/README-result.png) |
| Speak mode `/speak` | ![Speak challenge: category rail, sentence card, mic](docs/assets/README-speak.png) |

---

## What it does

1. **`/` (default)** — `KonglishExperience` loads the marketing/home flow: animated backdrop, **ColdOpenDemo** (3-round slice of the immigration scenario), **ScenarioPreview** grid for full scenarios, and supporting sections. Picking a scenario opens **GameShell**: three rounds, each with one NPC line and **three fixed choices** (hand-authored scores and reactions).

2. **`/speak`** — **SpeakGame**: pick a **category** (cafe, convenience store, class, date, shopping), read the **English sentence** aloud, get a **pass/fail** from fuzzy match vs transcript. Includes **demo judgment** and **practice self-pass** buttons for live demos when the mic or SR fails.

Branding strings live in `src/lib/game-meta.ts` (`GAME_DISPLAY_NAME`, taglines). Root layout metadata uses those exports.

---

## Gameplay (high level)

| Mode | Input | Outcome |
|------|--------|---------|
| Scenario game | Tap one of 3 choices per round | Running totals (naturalness, survival, cringe, confidence, understood count) → **ResultCard** with rank from `scenario.rankLadder` |
| Cold open demo | Same, but embedded 3-round subset | Teaches flow before grid |
| Speak mode | Mic (Web Speech API) or demo/self buttons | Similarity 0–100%, streak, panic meter, NPC-style pass/fail copy |

See [docs/gameplay.md](docs/gameplay.md) for detail.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router), **React 19** |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"` in `globals.css`) |
| Fonts | `next/font`: Geist Sans/Mono, Noto Sans KR |
| Build | `reactCompiler: true` in `next.config.ts` |
| Package manager | **pnpm** (see `packageManager` in `package.json`) |

---

## Architecture (short)

- **App Router**: `src/app/page.tsx` renders `KonglishExperience`; `src/app/speak/page.tsx` renders `SpeakGame`.
- **Scenario content**: `src/data/scenarios.ts` exports `SCENARIOS` (5 scenarios today: `convenience`, `professor`, `immigration`, `group-project`, `hongdae`). Each scenario has exactly **3 rounds**, each round **3 choices** — all scores and copy are static.
- **Speak content**: `src/data/speaking-challenges.ts` exports `SPEAKING_CATEGORIES` (5 categories, 6 sentences each in the shipped data).
- **Choice scoring**: `src/lib/scoring.ts` aggregates `ChoiceScores`, `compositeScore`, `pickRankTitle`, etc.
- **Speech scoring**: `src/lib/speech-scoring.ts` — normalize, Levenshtein + token Jaccard, `SPEECH_PASS_THRESHOLD` (0.76).
- **Web Speech typing**: `src/types/web-speech-recognition.ts` + `getWebSpeechRecognitionCtor()`.

Full diagrams: [ARCHITECTURE.md](ARCHITECTURE.md). Deep index: [DOCUMENTATION.md](DOCUMENTATION.md).

---

## Speech recognition (speak mode)

Uses the browser’s **`SpeechRecognition` / `webkitSpeechRecognition`** with `lang = "en-US"`. Transcripts are normalized and compared to the target sentence locally — **no audio leaves the app for a custom server** (browser vendor still processes speech per browser policy).

Unsupported browsers: UI explains Chrome-first behavior; **demo** and **self-certify practice** paths remain.

Detail: [docs/speech-recognition.md](docs/speech-recognition.md).

---

## Repository layout

```
src/
  app/
    layout.tsx          # Root layout, fonts, metadata from game-meta
    page.tsx            # Home → KonglishExperience
    globals.css         # Tailwind + shared utility classes (glass, neon buttons, etc.)
    speak/page.tsx      # Speak route metadata + SpeakGame
  components/
    KonglishExperience.tsx  # Screen router: home | game | result
    GameShell.tsx           # 3-round scenario loop, optional manual text fallback
    ColdOpenDemo.tsx        # Homepage embedded mini-game + link to /speak
    speak/                  # Speak mode UI pieces + SpeakGame.tsx
  data/
    scenarios.ts            # SCENARIOS
    speaking-challenges.ts  # SPEAKING_CATEGORIES
  lib/
    types.ts            # Scenario, Choice, Round, TurnRecord, …
    scoring.ts          # Totals + composite + ranks
    speech-scoring.ts   # Speak fuzzy match
    game-meta.ts        # Display name / taglines
    manual-fallback.ts  # Free-text → synthetic Choice for demo robustness
    microcopy.ts, scenario-teaser.ts, …
  types/
    web-speech-recognition.ts
```

---

## Local development

**Requirements:** Node compatible with Next 16, **pnpm** (recommended; lockfile is pnpm).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Speak mode: [http://localhost:3000/speak](http://localhost:3000/speak).

```bash
pnpm build    # production build
pnpm start     # run production server (after build)
pnpm lint      # ESLint (eslint-config-next)
```

No `.env` is required for current features (see `SECURITY.md`).

---

## Design philosophy

- **Korean-first UX** with English where the joke or lesson needs it.
- **Panic / arcade** aesthetic: dark zinc base, cyan/fuchsia accents, glass panels, readable type (including `.font-display` for display Korean).
- **Demo-first**: manual answer path in `GameShell`, speak-mode **demo** + **practice self-pass** so a booth presentation survives mic denial or Safari quirks.
- **Honest scope**: scripted content, not generative AI — reactions are written in data, not fetched from a model.

More: [docs/design-system.md](docs/design-system.md).

---

## Browser compatibility

| Feature | Practical note |
|---------|----------------|
| Scenario game | Modern evergreen browsers; layout uses `100dvh`, flex, grid |
| Web Speech (speak) | **Chrome / Chromium** best; Safari/Firefox support varies; code detects constructor absence |
| Fonts | Google fonts via `next/font` |

---

## Roadmap

Realistic next steps (not commitments): [docs/roadmap.md](docs/roadmap.md).

---

## Contributing

Issues and PRs welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting and threat model (frontend-only).

---

## License

[MIT](LICENSE)

---

## Authors

Add core team or hackathon group here when you publish (names, links, booth handle). Until then, see git history for contributors.
