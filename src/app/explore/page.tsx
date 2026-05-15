import type { Metadata } from "next";
import { CampusExplore } from "@/components/explore/CampusExplore";

export const metadata: Metadata = {
  title: "캠퍼스 생존 지도 · Foreign NPC",
  description:
    "세종대 감성 캠퍼스 맵에서 건물별 영어 미션 — 프론트만, 맵 API 없음.",
};

export default function ExplorePage() {
  return <CampusExplore />;
}
