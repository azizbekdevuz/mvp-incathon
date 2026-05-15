export type ChoiceScores = {
  naturalness: number;
  survival: number;
  cringe: number;
  confidence: number;
  /** Did the foreigner basically get your meaning? */
  understood: boolean;
};

export type Choice = {
  id: string;
  text: string;
  scores: ChoiceScores;
  reaction: string;
  betterEnglish: string;
  nativeVersion: string;
  koreanExplanation: string;
  warning?: string;
};

export type Round = {
  npcMessage: string;
  choices: [Choice, Choice, Choice];
};

export type Scenario = {
  id: string;
  titleKo: string;
  titleEn: string;
  description: string;
  npcName: string;
  npcPersonality: string;
  npcEmoji: string;
  difficulty: string;
  awkwardness: string;
  skillLabel: string;
  scenarioEmoji: string;
  introKo: string;
  rounds: [Round, Round, Round];
  /** Funny rank titles low → high performance */
  rankLadder: string[];
};

export type RunningTotals = {
  naturalness: number;
  survival: number;
  cringe: number;
  confidence: number;
  understoodCount: number;
};

export type TurnRecord = {
  roundIndex: number;
  choiceText: string;
  choice: Choice;
  manual: boolean;
};
