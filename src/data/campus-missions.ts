import type { SpeakingCategory } from "@/data/speaking-challenges";

/** Eight major Sejong landmarks only — stylized map, not GIS. */
export const CAMPUS_LANDMARK_IDS = [
  "main-gate",
  "athletics",
  "daeyang-hall",
  "gunja",
  "gwanggaeto",
  "library",
  "student-center",
  "daeyang-ai",
] as const;

export type CampusLandmarkId = (typeof CAMPUS_LANDMARK_IDS)[number];

/** Hit area on watercolor map (1536×1024 viewBox, normalized 0–1). */
export type CampusHotspotNorm = {
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

export type CampusLandmark = {
  id: CampusLandmarkId;
  nameKo: string;
  nameEn: string;
  /** HUD / stamp */
  shortLabel: string;
  /** Compact text on map marker pill (defaults to shortLabel) */
  markerLabel?: string;
  missionId: string;
  /** Diegetic tease near building */
  npcTease: string;
  /** Isolated building art (summon on focus) — `/assets/…` */
  heroArtSrc: string;
  /** Invisible interactive zone aligned to map painting */
  hotspotNorm: CampusHotspotNorm;
};

export type MissionKind = "speech" | "choice";

export type CampusChoiceOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type CampusChoiceMission = {
  promptKo: string;
  promptEn: string;
  options: [CampusChoiceOption, CampusChoiceOption, CampusChoiceOption];
  passLineKo: string;
  failLineKo: string;
  nativeTip: string;
};

export type CampusMissionDef = {
  id: string;
  titleKo: string;
  titleEn: string;
  type: MissionKind;
  speechCategoryId?: SpeakingCategory["id"];
  introKo: string;
  npcName: string;
  npcPreviewLine: string;
  difficultyLabel: string;
  panicLevel: 1 | 2 | 3 | 4 | 5;
  facilityNoteKo: string;
  choice?: CampusChoiceMission;
  /** RPG stage select — Korean-first title line */
  stageTitleKo?: string;
  stageSubtitleEn?: string;
  npcRoleKo?: string;
  /** Funny campus scenario (Korean) */
  scenarioSetupKo?: string;
  sampleChallengeLineEn?: string;
  rewardTeaserKo?: string;
  skillLabel?: string;
};

/** Map art intrinsic size — must match `public/assets/map_bg.png`. */
export const CAMPUS_MAP_VIEWBOX = { w: 1536, h: 1024 } as const;

export function landmarkBubblePct(lm: CampusLandmark): { left: number; top: number } {
  return {
    left: (lm.hotspotNorm.nx + lm.hotspotNorm.nw / 2) * 100,
    top: lm.hotspotNorm.ny * 100,
  };
}

export function landmarkSummonPct(lm: CampusLandmark): { left: number; top: number } {
  return {
    left: (lm.hotspotNorm.nx + lm.hotspotNorm.nw / 2) * 100,
    top: (lm.hotspotNorm.ny + lm.hotspotNorm.nh * 0.15) * 100,
  };
}

/** SVG-space center of landmark hotspot (same coords as `viewBox`). */
export function landmarkCenterSvg(lm: CampusLandmark): { x: number; y: number } {
  const { nx, ny, nw, nh } = lm.hotspotNorm;
  return {
    x: (nx + nw / 2) * CAMPUS_MAP_VIEWBOX.w,
    y: (ny + nh / 2) * CAMPUS_MAP_VIEWBOX.h,
  };
}

/**
 * Suggested campus tour order for “next mission” path glow — narrative flow only,
 * does not change map geometry.
 */
export const OVERWORLD_MISSION_PATH: readonly CampusLandmarkId[] = [
  "main-gate",
  "student-center",
  "daeyang-ai",
  "athletics",
  "daeyang-hall",
  "gunja",
  "gwanggaeto",
  "library",
] as const;

export function overworldPolylineD(
  landmarks: readonly CampusLandmark[],
  order: readonly CampusLandmarkId[] = OVERWORLD_MISSION_PATH,
): string {
  const byId = new Map(landmarks.map((l) => [l.id, l]));
  const chunks: string[] = [];
  for (let i = 0; i < order.length; i++) {
    const lm = byId.get(order[i]!);
    if (!lm) continue;
    const { x, y } = landmarkCenterSvg(lm);
    chunks.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return chunks.join(" ");
}

export function nextMissionLandmarkId(
  clearedIds: readonly string[],
  order: readonly CampusLandmarkId[] = OVERWORLD_MISSION_PATH,
): CampusLandmarkId | null {
  for (const id of order) {
    if (!clearedIds.includes(id)) return id;
  }
  return null;
}

/** Polyline for glow: from last cleared on route (or 정문) toward next uncleared. */
export function nextRouteGlowD(
  landmarks: readonly CampusLandmark[],
  clearedIds: readonly string[],
  order: readonly CampusLandmarkId[] = OVERWORLD_MISSION_PATH,
): string | null {
  const next = nextMissionLandmarkId(clearedIds, order);
  if (!next) return null;
  const byId = new Map(landmarks.map((l) => [l.id, l]));
  const toLm = byId.get(next);
  if (!toLm) return null;
  const ni = order.indexOf(next);
  let fromLm: CampusLandmark | undefined;
  if (ni > 0) {
    const prevId = order[ni - 1]!;
    fromLm = clearedIds.includes(prevId)
      ? byId.get(prevId)
      : byId.get("main-gate");
  } else {
    fromLm = byId.get("main-gate");
  }
  if (!fromLm) return null;
  const a = landmarkCenterSvg(fromLm);
  const b = landmarkCenterSvg(toLm);
  if (Math.hypot(a.x - b.x, a.y - b.y) < 8) return null;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function overworldClearedStreak(
  clearedIds: readonly string[],
  order: readonly CampusLandmarkId[] = OVERWORLD_MISSION_PATH,
): number {
  let n = 0;
  for (const id of order) {
    if (clearedIds.includes(id)) n += 1;
    else break;
  }
  return n;
}

/**
 * Hotspots tuned to watercolor `map_bg.png` (1536×1024): gate south, field west,
 * central spine + fountain, pond east, upper campus — approximate, not GIS.
 */
export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: "main-gate",
    nameKo: "정문",
    nameEn: "Main Gate",
    shortLabel: "정문",
    missionId: "mission-main-gate",
    npcTease: "Excuse me… is this Sejong?",
    heroArtSrc: "/assets/main_gate.png",
    hotspotNorm: { nx: 0.43, ny: 0.78, nw: 0.14, nh: 0.12 },
  },
  {
    id: "athletics",
    nameKo: "운동장",
    nameEn: "Athletics Field",
    shortLabel: "운동장",
    missionId: "mission-athletics",
    npcTease: "내일 몇 시에 모이지?",
    heroArtSrc: "/assets/playground.png",
    hotspotNorm: { nx: 0.05, ny: 0.34, nw: 0.28, nh: 0.36 },
  },
  {
    id: "daeyang-hall",
    nameKo: "대양홀",
    nameEn: "Daeyang Hall",
    shortLabel: "대양홀",
    missionId: "mission-daeyang-hall",
    npcTease: "발표 슬라이드 1장만…",
    heroArtSrc: "/assets/daeyang_hall.png",
    hotspotNorm: { nx: 0.51, ny: 0.58, nw: 0.12, nh: 0.11 },
  },
  {
    id: "gunja",
    nameKo: "군자관",
    nameEn: "Gunja-gwan",
    shortLabel: "군자관",
    missionId: "mission-gunja",
    npcTease: "행정실 영어 지옥.",
    heroArtSrc: "/assets/gunjagwan.png",
    hotspotNorm: { nx: 0.39, ny: 0.38, nw: 0.12, nh: 0.1 },
  },
  {
    id: "gwanggaeto",
    nameKo: "광개토관",
    nameEn: "Gwanggaeto-gwan",
    shortLabel: "광개토",
    missionId: "mission-gwanggaeto",
    npcTease: "팀플… 왜?",
    heroArtSrc: "/assets/gwanggaetogwan.png",
    hotspotNorm: { nx: 0.42, ny: 0.14, nw: 0.16, nh: 0.14 },
  },
  {
    id: "library",
    nameKo: "동천관 · 학술정보원",
    nameEn: "Dongcheon · Library",
    shortLabel: "도서관",
    missionId: "mission-library",
    npcTease: "조용히… 정확히.",
    heroArtSrc: "/assets/library.png",
    hotspotNorm: { nx: 0.62, ny: 0.3, nw: 0.14, nh: 0.12 },
  },
  {
    id: "student-center",
    nameKo: "학생회관",
    nameEn: "Student Center",
    shortLabel: "학생회관",
    missionId: "mission-student-center",
    npcTease: "영어 자기소개 30초.",
    heroArtSrc: "/assets/student_building.png",
    hotspotNorm: { nx: 0.48, ny: 0.44, nw: 0.12, nh: 0.1 },
  },
  {
    id: "daeyang-ai",
    nameKo: "대양AI센터",
    nameEn: "Daeyang AI Center",
    shortLabel: "AI센터",
    missionId: "mission-daeyang-ai",
    npcTease: "10초 피치.",
    heroArtSrc: "/assets/daeyang_ai.png",
    hotspotNorm: { nx: 0.64, ny: 0.1, nw: 0.13, nh: 0.11 },
  },
];

export const CAMPUS_MISSIONS: Record<string, CampusMissionDef> = {
  "mission-main-gate": {
    id: "mission-main-gate",
    titleKo: "정문 · 외국인 인카운터",
    titleEn: "Main Gate Encounter",
    type: "choice",
    introKo:
      "정문 앞 보도. 교환학생이 캠퍼스 지도를 펼침. 한 문장이면 생존.",
    npcName: "Exchange student Alex",
    npcPreviewLine: "Hey — which way is the library from here?",
    difficultyLabel: "입구 소셜",
    panicLevel: 2,
    facilityNoteKo: "세종대 정문 축 — 북쪽으로 캠퍼스 심장",
    stageTitleKo: "정문 · 외국인 길잡이 생존",
    stageSubtitleEn: "Main gate encounter",
    npcRoleKo: "교환학생 · 지도 펼침",
    scenarioSetupKo:
      "지도를 든 채로 ‘이게 세종이 맞죠?’ 눈빛. 한 문장이면 분위기 살린다.",
    sampleChallengeLineEn: "Hey — which way is the library from here?",
    rewardTeaserKo: "통과 시: ‘세종 길안내’ 칭호",
    skillLabel: "랜드마크 영어 안내",
    choice: {
      promptKo: "길 안내로 가장 자연스러운 한 문장은?",
      promptEn: "Pick the clearest line.",
      options: [
        {
          id: "g1",
          text: "Yes. Library is there. Very big. You go.",
          correct: false,
        },
        {
          id: "g2",
          text: "Go straight from the gate until you pass the big glass AI building — the library is on your right after that.",
          correct: true,
        },
        {
          id: "g3",
          text: "Maybe… library… hmm… sorry my English is poor.",
          correct: false,
        },
      ],
      passLineKo: "Alex: “Okay I can picture the route. Thanks.”",
      failLineKo: "Alex: “…I’ll just use Naver Map.”",
      nativeTip: "캠퍼스 랜드마크(광개토·AI센터·도서관) 순서로 짚어주기.",
    },
  },
  "mission-student-center": {
    id: "mission-student-center",
    titleKo: "학생회관 · 자기소개 배틀",
    titleEn: "Student Center",
    type: "choice",
    introKo:
      "동아리/학생활 허브. 선배가 영어로 자기소개하래. 이력서 말투면 바로 끊김.",
    npcName: "동아리 선배 Mina",
    npcPreviewLine: "30초 영어로. 이력서 말고 사람 말로.",
    difficultyLabel: "사회 생존",
    panicLevel: 3,
    facilityNoteKo: "학생회관 — 동아리·글로벌라운지·학생자치 느낌",
    stageTitleKo: "학생회관 · 자기소개 난장판",
    stageSubtitleEn: "Student hall social raid",
    npcRoleKo: "동아리 선배 · 미소는 인싸",
    scenarioSetupKo:
      "‘30초 영어로’라는 말이 나오면 이미 반은 패배한 거임. 이력서 말투 금지.",
    sampleChallengeLineEn: "Give me a 30-second intro — human, not résumé.",
    rewardTeaserKo: "통과 시: 동아리 ‘사람됨’ 스탬프",
    skillLabel: "스몰토크 영어",
    choice: {
      promptKo: "가장 자연스러운 자기소개는?",
      promptEn: "Which line sounds most human?",
      options: [
        {
          id: "s1",
          text: "My name is Kim. I am diligent person. Please choose me.",
          correct: false,
        },
        {
          id: "s2",
          text: "Hey, I’m Kim — I’m into photography and I joined because your posters looked unhinged in a good way.",
          correct: true,
        },
        {
          id: "s3",
          text: "I… uh… sorry English… little…",
          correct: false,
        },
      ],
      passLineKo: "선배: “오케이, 사람 나옴. 통과.”",
      failLineKo: "선배: “…다음.”",
      nativeTip: "취미/동기 한 줄이면 ‘사람’ 냄새 남.",
    },
  },
  "mission-daeyang-ai": {
    id: "mission-daeyang-ai",
    titleKo: "대양AI센터 · 테크 피치",
    titleEn: "Daeyang AI Center",
    type: "choice",
    introKo:
      "유리 파사드 느낌의 AI·창업 동선. 심사 TA가 영어로 한 문장 피치 요구.",
    npcName: "TA Jordan",
    npcPreviewLine: "One sentence: what problem are you solving?",
    difficultyLabel: "피치 압박",
    panicLevel: 4,
    facilityNoteKo: "대양AI센터 — 팀 데모·협업 공간 이미지",
    stageTitleKo: "대양AI · 10초 피치 지옥",
    stageSubtitleEn: "AI center pitch gauntlet",
    npcRoleKo: "데모데이 TA",
    scenarioSetupKo:
      "유리 건물 앞이면 자동으로 ‘스타트업 된 척’ 버프가 붙음. 한 문장이면 산다.",
    sampleChallengeLineEn: "One sentence: what problem are you solving?",
    rewardTeaserKo: "통과 시: ‘한 줄은 진짜’ 뱃지",
    skillLabel: "문제정의 영어",
    choice: {
      promptKo: "한 문장으로 가장 설득력 있는 피치는?",
      promptEn: "Best one-liner?",
      options: [
        {
          id: "a1",
          text: "We use AI blockchain synergy for next-gen paradigm shift.",
          correct: false,
        },
        {
          id: "a2",
          text: "We help students practice spoken English and get instant feedback — no extra hardware.",
          correct: true,
        },
        {
          id: "a3",
          text: "Sorry, my English is not good. Please see PPT page 7.",
          correct: false,
        },
      ],
      passLineKo: "Jordan: “Clear. I get it.”",
      failLineKo: "Jordan: “Buzzwords ≠ product.”",
      nativeTip: "문제 → 누구에게 → 결과 순.",
    },
  },
  "mission-library": {
    id: "mission-library",
    titleKo: "동천관 · 도서관 속삭임",
    titleEn: "Dongcheon · Library",
    type: "speech",
    speechCategoryId: "class",
    introKo:
      "열람실 공기. NPC가 영어 문장을 읽으래 — 크게 말하면 사회적 사망.",
    npcName: "사서형 NPC",
    npcPreviewLine: "Read it clearly… but respect the silence.",
    difficultyLabel: "학술 모드",
    panicLevel: 3,
    facilityNoteKo: "학술정보원(동천관) — 열람·스터디 존",
    stageTitleKo: "도서관 · 속삭임 발음 레이드",
    stageSubtitleEn: "Library whisper challenge",
    npcRoleKo: "사서형 NPC · 침묵 강화",
    scenarioSetupKo:
      "열람실 공기가 ‘너 크게 말하면 사회적 사망’이라고 말하는 중.",
    sampleChallengeLineEn: "Read it clearly… but respect the silence.",
    rewardTeaserKo: "통과 시: ‘도서관 생존자’ 이어폰 스티커(가짜)",
    skillLabel: "조용한 발음",
  },
  "mission-gwanggaeto": {
    id: "mission-gwanggaeto",
    titleKo: "광개토관 · 교수님 서바이벌",
    titleEn: "Gwanggaeto-gwan",
    type: "choice",
    introKo:
      "캠퍼스 중심축 랜드마크. 복도에서 교수님과 마주침 — 팀플 미완 주제.",
    npcName: "Professor Han",
    npcPreviewLine: "Why is your team project still… emotionally unstable?",
    difficultyLabel: "강의동 공포",
    panicLevel: 5,
    facilityNoteKo: "광개토관 — 대형 강의·학부 클러스터 중심",
    stageTitleKo: "교수님 앞 생존 미션",
    stageSubtitleEn: "Professor hallway survival",
    npcRoleKo: "Professor Han · 복도 스폰",
    scenarioSetupKo:
      "팀원이 ‘거의 다 했어’라고 하고 사라졌습니다. 지금 당신이 대표입니다.",
    sampleChallengeLineEn:
      "Can you explain why the project is still unfinished — with a plan?",
    rewardTeaserKo: "통과 시: 조별과제 생존자 뱃지",
    skillLabel: "사과+실행계획 영어",
    choice: {
      promptKo: "가장 생존 확률 높은 답은?",
      promptEn: "Safest reply?",
      options: [
        {
          id: "p1",
          text: "Because my teammate chose violence and disappeared.",
          correct: false,
        },
        {
          id: "p2",
          text: "We fell behind on integration, but here’s the concrete plan for the next 48 hours.",
          correct: true,
        },
        {
          id: "p3",
          text: "Sorry sorry sorry sorry (bowing only)",
          correct: false,
        },
      ],
      passLineKo: "교수님: “플랜부터.”",
      failLineKo: "교수님: “다음엔 일정으로 말해.”",
      nativeTip: "변명보다 타임라인.",
    },
  },
  "mission-athletics": {
    id: "mission-athletics",
    titleKo: "운동장 · 숫자·시간",
    titleEn: "Athletics Field",
    type: "choice",
    introKo:
      "잔디 트랙 느낌. 코치가 영어로 약속 시간을 못 박으래.",
    npcName: "Coach Rio",
    npcPreviewLine: "What time do we meet tomorrow — 5:30 or half past five?",
    difficultyLabel: "스케줄 청취",
    panicLevel: 2,
    facilityNoteKo: "캠퍼스 운동장 — 트랙·집회 공간",
    stageTitleKo: "운동장 · 시간 영어 스파이크",
    stageSubtitleEn: "Field schedule spike",
    npcRoleKo: "Coach Rio · 아침 러닝 마인드",
    scenarioSetupKo:
      "내일 몇 시인지 영어로 못 박으면… 그냥 단톡 지옥으로 돌아감.",
    sampleChallengeLineEn: "What time do we meet tomorrow — be specific.",
    rewardTeaserKo: "통과 시: ‘약속은 영어로’ 스티커",
    skillLabel: "시간·숫자 영어",
    choice: {
      promptKo: "가장 자연스러운 시간 표현은?",
      promptEn: "Pick the clearest time phrase.",
      options: [
        {
          id: "t1",
          text: "Tomorrow five thirty PM.",
          correct: false,
        },
        {
          id: "t2",
          text: "Let’s meet at 5:30 p.m. tomorrow at the main gate.",
          correct: true,
        },
        {
          id: "t3",
          text: "Tomorrow time is… uh… later.",
          correct: false,
        },
      ],
      passLineKo: "Coach: “Perfect. Don’t be late.”",
      failLineKo: "Coach: “What time is ‘later’?”",
      nativeTip: "a.m./p.m. + 장소.",
    },
  },
  "mission-daeyang-hall": {
    id: "mission-daeyang-hall",
    titleKo: "대양홀 · 공개 프레젠테이션",
    titleEn: "Daeyang Hall",
    type: "choice",
    introKo:
      "무대 조명 느낌. MC가 영어로 오프닝 한 문장만 딱 요구.",
    npcName: "MC Yuna",
    npcPreviewLine: "One sentence to hook the audience. Go.",
    difficultyLabel: "무대 압박",
    panicLevel: 4,
    facilityNoteKo: "대양홀 — 공연·집회·행사 이미지",
    stageTitleKo: "대양홀 · 오프닝 한 방",
    stageSubtitleEn: "Hall opener gauntlet",
    npcRoleKo: "MC Yuna · 조명이 이미 심판",
    scenarioSetupKo:
      "슬라이드 47장 준비한 사람 옆에서 ‘한 문장만’ 요구받는 기분.",
    sampleChallengeLineEn: "One sentence to hook the audience. Go.",
    rewardTeaserKo: "통과 시: ‘첫 문장 살림’ 리본",
    skillLabel: "훅 문장 영어",
    choice: {
      promptKo: "프레젠 오프닝으로 가장 강한 한 문장은?",
      promptEn: "Strongest opening line?",
      options: [
        {
          id: "d1",
          text: "Today I will talk about many things and please listen carefully thank you.",
          correct: false,
        },
        {
          id: "d2",
          text: "Tonight I’ll show you one mistake that almost ruined my semester — and how we fixed it in 48 hours.",
          correct: true,
        },
        {
          id: "d3",
          text: "Sorry I am nervous so I will read script.",
          correct: false,
        },
      ],
      passLineKo: "Yuna: “Hook OK. 계속.”",
      failLineKo: "Yuna: “다시. 첫 문장부터 살리자.”",
      nativeTip: "구체적 장면/갈등 한 스푼.",
    },
  },
  "mission-gunja": {
    id: "mission-gunja",
    titleKo: "군자관 · 행정·수강 영어",
    titleEn: "Gunja-gwan",
    type: "choice",
    introKo:
      "행정동선 느낌. 담당자가 영어로 이메일 제목부터 고치래.",
    npcName: "Staff Lee",
    npcPreviewLine: "Your subject line looks like a novel. Fix it in one line.",
    difficultyLabel: "사무실 서바이벌",
    panicLevel: 3,
    facilityNoteKo: "군자관 — 학사·행정 동선 이미지",
    stageTitleKo: "군자관 · 행정실 이메일 보스",
    stageSubtitleEn: "Admin email boss",
    npcRoleKo: "Staff Lee · 제목줄 감시",
    scenarioSetupKo:
      "제목에 느낌표 8개 넣으면… 행정실 필터에 걸려서 차원이동 당함.",
    sampleChallengeLineEn: "Fix your subject line in one professional line.",
    rewardTeaserKo: "통과 시: ‘제목은 한 줄’ 인장",
    skillLabel: "공문 영어",
    choice: {
      promptKo: "교수님께 보낼 이메일 제목으로 가장 안전한 것은?",
      promptEn: "Best email subject line?",
      options: [
        {
          id: "u1",
          text: "URGENT PLS READ!!!!!!!!!!",
          correct: false,
        },
        {
          id: "u2",
          text: "[IE123] Extension request — Kim Minseo — due to medical appointment (attached note)",
          correct: true,
        },
        {
          id: "u3",
          text: "Hello professor how are you I am your student",
          correct: false,
        },
      ],
      passLineKo: "Staff: “OK. 이건 통과.”",
      failLineKo: "Staff: “제목만 다시.”",
      nativeTip: "과목코드·이름·의도 한 줄.",
    },
  },
};

export function getCampusMission(missionId: string): CampusMissionDef | undefined {
  return CAMPUS_MISSIONS[missionId];
}

export function getLandmarkById(id: string): CampusLandmark | undefined {
  return CAMPUS_LANDMARKS.find((b) => b.id === id);
}

export type MissionStagePresentation = {
  stageTitleKo: string;
  stageSubtitleEn: string;
  npcRoleKo: string;
  scenarioSetupKo: string;
  challengeLineEn: string;
  rewardTeaserKo: string;
  skillLabel: string;
};

export function missionStagePresentation(m: CampusMissionDef): MissionStagePresentation {
  const titleParts = m.titleKo.split("·").map((s) => s.trim());
  return {
    stageTitleKo: m.stageTitleKo ?? titleParts[0] ?? m.titleKo,
    stageSubtitleEn: m.stageSubtitleEn ?? m.titleEn,
    npcRoleKo: m.npcRoleKo ?? "캠퍼스 NPC",
    scenarioSetupKo:
      m.scenarioSetupKo ??
      (m.introKo.length > 72 ? `${m.introKo.slice(0, 72)}…` : m.introKo),
    challengeLineEn: m.sampleChallengeLineEn ?? m.npcPreviewLine,
    rewardTeaserKo:
      m.rewardTeaserKo ??
      (m.type === "choice" ? "통과 시: 캠퍼스 생존 기록 +1" : "통과 시: 발음 생존 기록 +1"),
    skillLabel: m.skillLabel ?? m.difficultyLabel,
  };
}

export function campusRankTitle(cleared: number, total: number): string {
  if (total <= 0) return "캠퍼스 방랑자";
  const ratio = cleared / total;
  if (cleared >= total) return "캠퍼스 외국어 최종보스";
  if (ratio >= 0.875) return "세종 영어 NPC";
  if (ratio >= 0.625) return "교수님 이메일 생존러";
  if (ratio >= 0.375) return "조별과제 피해자";
  if (ratio >= 0.125) return "신입생 생존자";
  return "캠퍼스 입문 단계";
}

/** Rotating diegetic campus chatter — not real telemetry. */
export const CAMPUS_ATMOSPHERE_TICKERS = [
  "중앙 광개토 앞: 영어 멈춤 사건 3건",
  "정문→도서관 동선: 방향 질문 급증",
  "대양홀: 발표 오프닝 멘붕 2명",
  "AI센터: ‘한 문장 피치’ 요청 증가",
] as const;
