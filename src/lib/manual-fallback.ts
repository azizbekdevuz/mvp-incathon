import type { Choice } from "@/lib/types";

export function manualChoiceFromText(raw: string): Choice {
  const text = raw.trim() || "(…무음/공백. 카운터 공기만 차지함.)";
  return {
    id: "manual",
    text,
    scores: {
      naturalness: 46,
      survival: 48,
      cringe: 52,
      confidence: 44,
      understood: true,
    },
    reaction:
      "NPC 스크롤 멈춤. 뭔가 왔는데… 해석 미션 임파서블. 버튼 선택지도 같이 봐주면 엔진이 더 화끈하게 굴어요.",
    betterEnglish:
      "Could you help me respond clearly in one or two sentences? I want to sound natural.",
    nativeVersion:
      "Hey — I might be mixing languages. What’s the cleanest way to say this?",
    koreanExplanation:
      "MVP에선 자유 입력을 ‘중간쯤 품질’로 처리함. 해커톤 이후엔 진짜 채점/모델 연결 가능.",
    warning:
      "완전 장난 멘트만 쓰면 현실에서도 같은 반응 나올 수 있음(진지).",
  };
}
