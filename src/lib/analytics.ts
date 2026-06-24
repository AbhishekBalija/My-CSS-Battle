import { solutions, profile } from "./data";
import { parseDate, formatDate } from "./dates";
import { detectTechniques } from "./detect";
import type { Solution } from "../types";

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

function isSolved(s: Solution): boolean {
  return s.score != null && s.score > 0;
}

function computeStreaks(dailies: Solution[]): { current: number; longest: number } {
  const solvedDates = new Set(
    dailies.filter(isSolved).map((d) => formatDate(parseDate(d.date)))
  );
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  let current = 0;
  for (let i = 0; i < 400; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (solvedDates.has(key)) current++;
    else if (i === 0) continue;
    else break;
  }

  const sorted = [...solvedDates].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const s of sorted) {
    const d = new Date(s + "T00:00:00Z");
    if (prev) {
      const diff = (d.getTime() - prev.getTime()) / 86400000;
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prev = d;
  }
  return { current, longest };
}

export function getAnalytics(): Analytics {
  const dailies = solutions
    .filter((s) => s.type === "daily")
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
  const battles = solutions.filter((s) => s.type === "battle");

  const solvedDailies = dailies.filter(isSolved);
  const solvedBattles = battles.filter(isSolved);
  const allSolved = [...solvedDailies, ...solvedBattles];

  const { current, longest } = computeStreaks(dailies);

  const totalChars = allSolved.reduce((a, b) => a + (b.characters || 0), 0);
  const avgScore = allSolved.length
    ? allSolved.reduce((a, b) => a + (b.score || 0), 0) / allSolved.length
    : 0;
  const avgChar = allSolved.length
    ? allSolved.reduce((a, b) => a + (b.characters || 0), 0) / allSolved.length
    : 0;
  const avgMatch = allSolved.length
    ? allSolved.reduce((a, b) => a + (b.match || 0), 0) / allSolved.length
    : 0;

  const bestScore = allSolved.reduce<Solution | null>(
    (best, s) => (!best || (s.score || 0) > (best.score || 0) ? s : best),
    null
  );
  const fewestChars = allSolved.reduce<Solution | null>(
    (best, s) => (!best || (s.characters || 0) < (best.characters || 0) ? s : best),
    null
  );

  const series = solvedDailies.slice().sort((a, b) =>
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  return {
    currentStreak: current,
    longestStreak: longest,
    totalDailySolved: solvedDailies.length,
    totalDailyAvailable: dailies.length,
    totalCharsWritten: totalChars,
    avgScore,
    avgCharCount: avgChar,
    avgMatch,
    bestScore,
    fewestChars,
    scoreSeries: series.map((d) => ({
      date: d.date,
      score: d.score!,
      name: d.name,
    })),
    charSeries: series.map((d) => ({
      date: d.date,
      charCount: d.characters!,
      name: d.name,
    })),
    matchSeries: series.map((d) => ({
      date: d.date,
      matchPercent: d.match!,
      name: d.name,
    })),
    heatmap: buildHeatmap(dailies),
    monthly: buildMonthly(solvedDailies),
    battles: {
      total: battles.length,
      solved: solvedBattles.length,
      avgScore: solvedBattles.length
        ? solvedBattles.reduce((a, b) => a + (b.score || 0), 0) / solvedBattles.length
        : 0,
      avgChars: solvedBattles.length
        ? solvedBattles.reduce((a, b) => a + (b.characters || 0), 0) / solvedBattles.length
        : 0,
    },
    profile: {
      rating: profile.rating,
      rank: profile.rank,
      totalScore: profile.totalScore,
      totalPlayers: profile.totalPlayers,
      dailyTargetsPlayed: profile.dailyTargetsPlayed,
    },
    approachBreakdown: buildApproachBreakdown(allSolved),
  };
}

const APPROACH_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "oklch(0.60 0.10 180)",
  "oklch(0.65 0.12 330)",
];

function buildApproachBreakdown(solutions: Solution[]): { name: string; count: number; fill: string }[] {
  const counts = new Map<string, number>();
  for (const s of solutions) {
    const techniques = detectTechniques(s.code || "");
    for (const t of techniques) {
      counts.set(t.label, (counts.get(t.label) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count], i) => ({
      name,
      count,
      fill: APPROACH_COLORS[i % APPROACH_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);
}

function heatmapLevel(charCount: number): 0 | 1 | 2 | 3 | 4 {
  if (charCount < 130) return 4;
  if (charCount < 170) return 3;
  if (charCount < 220) return 2;
  return 1;
}

function buildHeatmap(dailies: Solution[]): Analytics["heatmap"] {
  const charByDate = new Map<string, number>();
  for (const d of dailies) {
    if (isSolved(d)) charByDate.set(formatDate(parseDate(d.date)), d.characters || 200);
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const out: Analytics["heatmap"] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const c = charByDate.get(key);
    out.push({ date: key, level: c != null ? heatmapLevel(c) : 0 });
  }
  return out;
}

function buildMonthly(dailies: Solution[]): Analytics["monthly"] {
  const map = new Map<string, Solution[]>();
  for (const d of dailies) {
    if (!isSolved(d)) continue;
    const date = parseDate(d.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const arr = map.get(key) ?? [];
    arr.push(d);
    map.set(key, arr);
  }

  const out: Analytics["monthly"] = [];
  for (const [monthKey, entries] of map) {
    const sorted = [...entries].sort((a, b) => (a.characters || 0) - (b.characters || 0));
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    out.push({
      monthKey,
      solved: entries.length,
      avgScore: entries.reduce((a, b) => a + (b.score || 0), 0) / entries.length,
      avgChars: entries.reduce((a, b) => a + (b.characters || 0), 0) / entries.length,
      totalChars: entries.reduce((a, b) => a + (b.characters || 0), 0),
      best: best ? { id: best.id, charCount: best.characters!, name: best.name } : undefined,
      worst: worst ? { id: worst.id, charCount: worst.characters!, name: worst.name } : undefined,
    });
  }
  out.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  return out;
}
