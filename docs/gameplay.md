# Gameplay

This doc matches **implemented** behavior in `src/components` and `src/data`.

## Mode A — Scenario survival (choice game)

**Entry:** `/` → `KonglishExperience` → user picks a card in `ScenarioPreview` (or plays the cold open then jumps to a full scenario).

**Core loop (`GameShell`):**

1. Show `introKo` as a system line, then round 0 `npcMessage`.  
2. User picks **one of three** `Choice` buttons (`PanicChoiceButton`).  
3. Chat appends “you” line (`choice.text`) and NPC `reaction`.  
4. `ChoiceScores` merge into session totals (`applyScores`).  
5. User confirms → next round’s NPC message; repeat until round 3 completes.  
6. `onFinish` passes `TurnRecord[]` upward; `ResultCard` shows aggregate feedback and `pickRankTitle`.

**Rounds and content:** each `Scenario` in `src/data/scenarios.ts` defines exactly **3** `Round` objects; each round has **3** choices. Scores are **static** — picking a line always yields the same numeric outcome.

**Manual answer:** optional text field maps through `manualChoiceFromText` to a synthetic `Choice` so demos do not break if someone ignores the buttons.

**Cold open:** `ColdOpenDemo` is not generic — it hard-wires the **immigration** scenario slice for a quick vertical demo before users scroll to the full grid.

## Mode B — Speak challenge (`/speak`)

**Entry:** direct route or CTA from `ColdOpenDemo` → `Link` to `/speak`.

**Loop (`SpeakGame`):**

1. User selects **category** (`CategoryRail` → `SPEAKING_CATEGORIES`).  
2. `SentenceCard` shows current `SpeakingSentence` (index cycles with “Next sentence” on pass).  
3. User triggers **Try Speaking** → Web Speech listens (`en-US`), transcript updates live when interim results exist.  
4. On recognition end, `similarityScore(sentence, transcript)` drives pass/fail vs `SPEECH_PASS_THRESHOLD`.  
5. `SpeechResult` shows score %, band label, NPC pass/fail strings from data, `nativeTip`, rank title, streak.

**Fallbacks (demo-first):**

- **데모 판정** — builds a fake transcript string (sometimes truncated) and runs the same scorer; labeled as demo-only in UI.  
- **읽었다 (연습 자가판정)** — forces pass path for booth practice; clearly **not** a real mic judgment.

## Scoring philosophy (design intent)

- **Scenario game:** teach tradeoffs (naturalness vs survival vs cringe) through **authored** NPC judgment — faster than ML and stable for judges.  
- **Speak mode:** approximate “close enough” for noisy SR, not phonetic science.

## Korean–English humor direction

- NPCs are **characters** (tired clerk, skeptical professor, etc.), not stereotypes of real nationalities as punchlines.  
- Korean copy often explains **why** a line lands wrong for English ears.  
- UI leans **university panic** / social awkwardness — assignment corruption, “networking vs date,” 편의점 1+1 energy.

## UX goals

- **Readable in a noisy room:** large type on sentence card, high-contrast neon-on-zinc.  
- **No scroll gate on speak:** game chrome is the hero on `/speak`.  
- **Escape hatches:** manual text in scenario game; demo + self-pass on speak mode.
