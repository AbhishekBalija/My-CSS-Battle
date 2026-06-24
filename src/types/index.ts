import type React from "react";

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
  fewestChars: Solution | null;
  scoreSeries: { date: string; score: number; name: string }[];
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
  };
  profile: {
    rating: number;
    rank: number;
    totalScore: number;
    totalPlayers: number;
    dailyTargetsPlayed: number;
  };
  approachBreakdown: { name: string; count: number; fill: string }[];
};

