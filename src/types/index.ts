import type React from "react";

export interface SolutionApproach {
  id: string;
  label: string;
  score: number;
  match: number;
  characters: number;
  timestamp: string;
  tags: string[];
  code: string;
  /** Optional author note on the key trick, 1-200 chars, one line. */
  insight?: string;
}

export interface Solution {
  id: string;
  name: string;
  type: 'daily' | 'battle';
  battleNumber?: number;
  targetNumber?: number;
  score: number;
  match: number;
  characters: number;
  colors: string[];
  date: string;
  timestamp: string;
  tags: string[];
  url: string;
  targetImage: string;
  code: string;
  approaches?: SolutionApproach[];
  bestApproachId?: string;
}

export interface Profile {
  userId: string;
  username: string;
  displayName: string;
  avatar: string | null;
  rating: number;
  rank: number;
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  dailyTargetsPlayed: number;
  dailyAvgMatch: number;
  dailyAvgChars: number;
  totalPlayers: number;
  country: string;
  whatYouDo: string;
  links: {
    website: string;
    github: string;
    twitter: string;
    linkedin: string;
  };
}

/** One entry of content/profileHistory.json (a scraped profile snapshot). */
export interface ProfileSnapshot {
  userId: string;
  rank: number;
  rankChange: number;
  playedCount: number;
  totalPlayers: number;
  totalScore: number;
  lastUpdated: string;
  snapshotDate: string;
}

/**
 * One entry of content/dailyPlayed.json: a daily played on CSSBattle, read
 * from its daily calendar. Metadata only, so days whose code couldn't be
 * recovered still count towards the streak.
 */
export interface DailyPlayed {
  date: string;
  score: number;
  characters: number;
}

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: Record<"light" | "dark", string>;
  }
>;

export type Analytics = {
  currentStreak: number;
  longestStreak: number;
  totalDailySolved: number;
  totalDailyAvailable: number;
  totalCharsWritten: number;
  avgScore: number;
  avgCharCount: number;
  avgMatch: number;
  bestScore: Solution | null;
  biggestCut: { solution: Solution; from: number; to: number } | null;
  weeklyScores: { weekStart: string; avgScore: number; solved: number }[];
  rankSeries: { date: string; rank: number }[];
  charSeries: { date: string; charCount: number; name: string }[];
  matchSeries: { date: string; matchPercent: number; name: string }[];
  heatmap: { date: string; level: 0 | 1 | 2 | 3 | 4 }[];
  monthly: {
    monthKey: string;
    solved: number;
    avgScore: number;
    avgChars: number;
    totalChars: number;
    best?: { id: string; charCount: number; name: string };
    worst?: { id: string; charCount: number; name: string };
  }[];
  battles: {
    total: number;
    solved: number;
    avgScore: number;
    avgChars: number;
    series: { battleNumber: number; name: string; score: number; chars: number }[];
  };
  profile: {
    rating: number;
    rank: number;
    totalScore: number;
    totalPlayers: number;
    dailyTargetsPlayed: number;
  };
  approachBreakdown: { name: string; count: number; fill: string }[];
  techniqueBreakdown: { name: string; count: number; fill: string }[];
};
