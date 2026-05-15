/** Rotating punch lines — Korean first. */
export const PANIC_QUIPS = [
  "뜻은 전달됨. 분위기는 사망.",
  "문법은 살았는데 사람은 죽음.",
  "교수님께 보내면 답장 안 올 확률 73%.",
  "원어민 뇌 0.7초 정지.",
  "Konglish detected. 생존은 가능.",
  "영어 공부 아님. 영어 생존임.",
  "틀리면 NPC가 감정 과금함.",
  "문장은 맞는데… 분위기는 장례식.",
] as const;

export function randomQuip(): string {
  const i = Math.floor(Math.random() * PANIC_QUIPS.length);
  return PANIC_QUIPS[i] ?? PANIC_QUIPS[0];
}
