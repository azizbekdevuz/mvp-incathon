/** Normalize for fuzzy speech comparison */
export function normalizeSpeechText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

/** Jaccard similarity on word sets */
function tokenOverlapScore(a: string, b: string): number {
  const wordsA = normalizeSpeechText(a).split(" ").filter(Boolean);
  const wordsB = normalizeSpeechText(b).split(" ").filter(Boolean);
  if (!wordsA.length && !wordsB.length) return 1;
  if (!wordsA.length || !wordsB.length) return 0;
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let inter = 0;
  for (const w of setA) {
    if (setB.has(w)) inter++;
  }
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

/** 0–1 combined similarity: char-level + token overlap */
export function similarityScore(expected: string, spoken: string): number {
  const e = normalizeSpeechText(expected);
  const s = normalizeSpeechText(spoken);
  if (!e.length && !s.length) return 1;
  if (!e.length || !s.length) return 0;
  const dist = levenshtein(e, s);
  const maxLen = Math.max(e.length, s.length);
  const charSim = 1 - dist / maxLen;
  const tokenSim = tokenOverlapScore(e, s);
  return Math.min(1, 0.45 * charSim + 0.55 * tokenSim);
}

/** Pass if similarity >= threshold (tuned for noisy SR) */
export const SPEECH_PASS_THRESHOLD = 0.76;

export function passesSpeechThreshold(score: number): boolean {
  return score >= SPEECH_PASS_THRESHOLD;
}

export type ScoreBandLabel = {
  min: number;
  max: number;
  label: string;
};

export const SCORE_BANDS: ScoreBandLabel[] = [
  { min: 90, max: 100, label: "Native Energy" },
  { min: 75, max: 89, label: "Survived" },
  { min: 55, max: 74, label: "Understandable Chaos" },
  { min: 30, max: 54, label: "Konglish Storm" },
  { min: 0, max: 29, label: "NPC Shutdown" },
];

export function scoreLabelFromPercent(percent: number): string {
  const p = Math.round(percent);
  for (const band of SCORE_BANDS) {
    if (p >= band.min && p <= band.max) return band.label;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1].label;
}
