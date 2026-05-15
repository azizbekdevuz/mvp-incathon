# Speech recognition (speak mode)

Implementation: `src/components/speak/SpeakGame.tsx`, `src/types/web-speech-recognition.ts`, `src/lib/speech-scoring.ts`.

## Which browser API

The code looks for:

```ts
window.SpeechRecognition ?? window.webkitSpeechRecognition
```

via `getWebSpeechRecognitionCtor()`. Constructed with `lang = "en-US"`, `interimResults = true`, `continuous = false`.

**Important:** recognition runs **in the user’s browser**. This repo does not ship a custom speech-to-text server; whatever cloud or on-device processing the browser vendor uses is outside this codebase.

## Why no backend

Hackathon MVP goals:

- Zero API keys in repo / env for judges to copy.  
- Works after `pnpm build` on static hosting (aside from HTTPS + browser support).  
- Deterministic scoring once a transcript string exists.

## Support detection

`SpeakGame` uses `useSyncExternalStore` with:

- **Client snapshot:** `Boolean(getWebSpeechRecognitionCtor())`  
- **Server snapshot:** `false`

That avoids hydration mismatch and keeps ESLint happy vs `useEffect` + `setState` for the same fact.

## Listening lifecycle

1. Increment `sessionRef` so stale `onend` handlers from a previous session never double-judge.  
2. `stop()` prior instance if any.  
3. Accumulate `heardRef` + `transcript` state from `onresult`.  
4. `onend`: single guarded call to judgment (`judgedForSessionRef`).  
5. `onerror`: stop listening UI; judgment still relies on `onend` in normal Chrome flows (empty transcript → low similarity).

## Transcript normalization

`normalizeSpeechText` (`speech-scoring.ts`):

- Lowercase  
- Replace non `[a-z0-9\s]` with space (ASCII-oriented; targets are English prompts)  
- Collapse whitespace  

This keeps SR punctuation quirks from tanking scores unnecessarily.

## Fuzzy matching

`similarityScore(expected, spoken)`:

1. Normalize both strings.  
2. **Character channel:** `1 - levenshtein(a,b) / max(len)`  
3. **Token channel:** Jaccard index on word sets after split-on-space  
4. **Blend:** `0.45 * charSim + 0.55 * tokenSim`, capped at 1  

`passesSpeechThreshold` compares to **`SPEECH_PASS_THRESHOLD = 0.76`** — tuned so minor ASR word swaps can still pass.

Display bands (`Native Energy`, `Survived`, …) come from `scoreLabelFromPercent` on the **percentage** (`similarity * 100`), not a separate phoneme model.

## Fallback modes (UX contract)

| Control | Behavior |
|---------|----------|
| Try Speaking | Real SR when constructor exists |
| 데모 판정 | Random-ish shortened transcript → same scorer; banner notes simulation |
| 읽었다 (연습 자가판정) | Pass with practice disclaimer; still shows tips |

Unsupported constructor: banner suggests Chrome; demo/self still work.

## Browser support (practical)

| Browser class | Expectation |
|---------------|-------------|
| Chrome / Edge (Chromium) | Primary target for Web Speech |
| Safari / Firefox | May lack constructor — UI degrades gracefully |
| Insecure `http://` (non-localhost) | Mic / SR may be blocked — use HTTPS demos |

## Privacy note for presenters

Assume **vendor** may log or improve models from audio per **their** policy. Do not read sensitive documents aloud into the demo mic.
