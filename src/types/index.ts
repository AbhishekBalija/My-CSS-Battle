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

export interface ProfileHistoryEntry {
  userId: string;
  rank: number;
  rankChange: number;
  playedCount: number;
  totalPlayers: number;
  totalScore: number;
  lastUpdated: string;
  snapshotDate: string;
}

export interface TechniqueTag {
  label: string;
}

export interface BattleGroup {
  battleNumber: number;
  targets: Solution[];
}

export interface DailyTimeline {
  today: Solution | null;
  yesterday: Solution | null;
  tomorrow: { date: string; locked: boolean } | null;
  past: Solution[];
  all: Solution[];
}