export interface SurveyResponse {
  timestamp: string;
  consent: string;
  currentlyTeaching: string;
  
  supportQ1: number | null;
  supportQ2: number | null;
  supportQ3: number | null;
  supportQ4: number | null;
  supportQ5: number | null;
  supportQ6: number | null;
  
  challengeQ1: number | null;
  challengeQ2: number | null;
  challengeQ3: number | null;
  challengeQ4: number | null;
  challengeQ5: number | null;
  challengeQ6: number | null;
  
  hasCertification: string;
  levelsTeaching: string;
  yearsTeaching: string;
  schoolType: string;
  groupSize: number | null;
  shareSupportStudents: string;
  shareChallengeStudents: string;
  
  supportAdaptationIndex: number | null;
  challengeAdaptationIndex: number | null;
  yearsTeachingCategory: string;
}

export interface Filters {
  currentlyTeaching: string[];
  schoolType: string[];
  yearsTeachingCategory: string[];
  levelsTeaching: string[];
  groupSizeMin: number;
  groupSizeMax: number;
  shareSupportStudents: string[];
  shareChallengeStudents: string[];
}

export interface SummaryStats {
  totalResponses: number;
  avgSupport: number;
  avgChallenge: number;
  difference: number;
}

export interface FactorImpact {
  variable: string;
  category: string;
  meanIndex: number;
  diffFromOverall: number;
  count: number;
  probability: number;
}

export interface QuestionStats {
  question: string;
  mean: number;
  median: number;
  stdDev: number;
  percentHighUse: number;
}
