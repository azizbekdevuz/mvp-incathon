/** Minimal types for Web Speech API (not always in TS lib.dom). */

export type WebSpeechRecognitionResultList = ArrayLike<{
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}>;

export type WebSpeechRecognitionEvent = {
  readonly resultIndex: number;
  readonly results: WebSpeechRecognitionResultList;
};

export type WebSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((ev: WebSpeechRecognitionEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

export type WebSpeechRecognitionCtor = new () => WebSpeechRecognition;

export function getWebSpeechRecognitionCtor():
  | WebSpeechRecognitionCtor
  | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: WebSpeechRecognitionCtor;
    webkitSpeechRecognition?: WebSpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}
