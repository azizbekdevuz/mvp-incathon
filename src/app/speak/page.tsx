import type { Metadata } from "next";
import { SpeakGame } from "@/components/speak/SpeakGame";

export const metadata: Metadata = {
  title: "말하면 산다 · Speak or Get Roasted",
  description:
    "영어 문장 읽고 살아남는 발음 생존 게임 — 브라우저 음성인식만 사용, 서버 없음.",
};

export default function SpeakPage() {
  return <SpeakGame />;
}
