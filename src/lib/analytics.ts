import { solutions, profile, profileHistory } from "./data";
import {
  parseDate,
  formatDate,
  isValidDate,
  calendarDaysBetween,
  addCalendarDays,
} from "./dates";
import { detectApproach, detectTechniques } from "./detect";
import {
  getBestApproach,
  getOrderedApproaches,
  getSolutionApproaches,
} from "./approaches";
import type { Solution, Analytics, ProfileSnapshot } from "../types";

function isSolved(s: Solution): boolean {
  return s.score != null && s.score > 0;
}

/** Stable UTC date key for a solution; skips invalid dates. */
function solutionDateKey(s: Solution): string | null {
  const d = parseDate(s.date);
  if (!isValidDate(d)) return null;
  return formatDate(d);
}

function dateTime(dateStr: string): number {
  const t = parseDate(dateStr).getTime();
  return Number.isFinite(t) ? t : 0;
}

function computeStreaks(dailies: Solution[]): { current: number; longest: number } {
  const solvedDates = new Set(
    dailies
      .filter(isSolved)
      .map(solutionDateKey)
      .filter((k): k is string => k != null && k !== ""),
  );

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  let current = 0;
  for (let i = 0; i < 400; i++) {
    const d = addCalendarDays(today, -i);
    const key = formatDate(d);
    if (solvedDates.has(key)) current++;
    else if (i === 0) continue; // allow missing "today" without breaking streak
    else break;
  }

  const sorted = [...solvedDates].sort();
  let longest = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const s of sorted) {
    const d = parseDate(s);
    if (!isValidDate(d)) continue;
    if (prev) {
      const diff = calendarDaysBetween(prev, d);
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
    .sort((a, b) => dateTime(a.date) - dateTime(b.date));
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
  const series = solvedDailies
    .slice()
    .sort((a, b) => dateTime(a.date) - dateTime(b.date));

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
    biggestCut: findBiggestCut(allSolved),
    weeklyScores: buildWeeklyScores(dailies),
    rankSeries: buildRankSeries(profileHistory),
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
      series: buildBattleSeries(battles),
    },
    profile: {
      rating: profile.rating,
      rank: profile.rank,
      totalScore: profile.totalScore,
      totalPlayers: profile.totalPlayers,
      dailyTargetsPlayed: profile.dailyTargetsPlayed,
    },
    approachBreakdown: buildApproachBreakdown(allSolved),
    techniqueBreakdown: buildTechniqueBreakdown(allSolved),
  };
}

const APPROACH_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
  "var(--color-chart-7)",
];

type BreakdownRow = { name: string; count: number; fill: string };

/** Sorts most used first, then gives colours so the top bars get the most distinct ones. */
function toBreakdownRows(counts: Map<string, number>): BreakdownRow[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], i) => ({
      name,
      count,
      fill: APPROACH_COLORS[i % APPROACH_COLORS.length],
    }));
}

/**
 * The overall strategy of each solve (nested template, single element...).
 * One per solve, read from its best approach, so the bars add up to the
 * number of solves.
 */
export function buildApproachBreakdown(solutions: Solution[]): BreakdownRow[] {
  const counts = new Map<string, number>();
  for (const s of solutions) {
    const best = getOrderedApproaches(s)[0];
    const label = detectApproach(best?.code || "");
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return toBreakdownRows(counts);
}

/**
 * CSS features used (gradients, mask, css vars...). Looks at every saved
 * approach of a solve, but counts a feature once per solve so extra
 * approaches don't inflate the numbers.
 */
export function buildTechniqueBreakdown(solutions: Solution[]): BreakdownRow[] {
  const counts = new Map<string, number>();
  for (const s of solutions) {
    const labels = new Set<string>();
    for (const approach of getSolutionApproaches(s)) {
      const code = approach.code || "";
      const approachLabel = detectApproach(code);
      for (const t of detectTechniques(code)) {
        if (t.label !== approachLabel) labels.add(t.label);
      }
    }
    for (const label of labels) {
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  }
  return toBreakdownRows(counts);
}

/**
 * The solve where the best approach saved the most characters compared to
 * the first one saved. Only counts real improvements (best shorter than first).
 */
export function findBiggestCut(solutions: Solution[]): Analytics["biggestCut"] {
  let biggest: Analytics["biggestCut"] = null;
  for (const s of solutions) {
    const approaches = getSolutionApproaches(s);
    if (approaches.length < 2) continue;

    const first = [...approaches].sort((a, b) => dateTime(a.timestamp) - dateTime(b.timestamp))[0]!;
    const best = getBestApproach(approaches, s.bestApproachId)!;
    const saved = first.characters - best.characters;

    if (saved > 0 && (!biggest || saved > biggest.from - biggest.to)) {
      biggest = { solution: s, from: first.characters, to: best.characters };
    }
  }
  return biggest;
}

/**
 * Average daily score per week (weeks start on Sunday, same as the heatmap).
 * One bar per week keeps the chart readable as dailies pile up.
 */
export function buildWeeklyScores(dailies: Solution[]): Analytics["weeklyScores"] {
  const weeks = new Map<string, number[]>();
  for (const d of dailies) {
    if (!isSolved(d)) continue;
    const date = parseDate(d.date);
    if (!isValidDate(date)) continue;
    const weekStart = formatDate(addCalendarDays(date, -date.getUTCDay()));
    const scores = weeks.get(weekStart) ?? [];
    scores.push(d.score);
    weeks.set(weekStart, scores);
  }
  return [...weeks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, scores]) => ({
      weekStart,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      solved: scores.length,
    }));
}

/** Global rank per day from the profile snapshots (last snapshot of each day wins). */
export function buildRankSeries(
  history: Pick<ProfileSnapshot, "rank" | "snapshotDate">[],
): Analytics["rankSeries"] {
  const byDay = new Map<string, { time: number; rank: number }>();
  for (const snap of history) {
    const time = Date.parse(snap.snapshotDate);
    if (!Number.isFinite(time)) continue;
    const day = snap.snapshotDate.slice(0, 10);
    const current = byDay.get(day);
    if (!current || time > current.time) byDay.set(day, { time, rank: snap.rank });
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { rank }]) => ({ date, rank }));
}

/** Solved battles in battle-number order, for the battles chart. */
export function buildBattleSeries(battles: Solution[]): Analytics["battles"]["series"] {
  return battles
    .filter((b) => isSolved(b) && b.battleNumber != null)
    .sort((a, b) => (a.battleNumber ?? 0) - (b.battleNumber ?? 0))
    .map((b) => ({
      battleNumber: b.battleNumber!,
      name: b.name,
      score: b.score,
      chars: b.characters,
    }));
}

/**
 * Quarter points of your own char counts, so heatmap colours stay meaningful
 * as you get better (fixed cut-offs would put most days in one shade).
 */
export function heatmapThresholds(chars: number[]): [number, number, number] {
  const sorted = [...chars].sort((a, b) => a - b);
  const at = (q: number) => sorted[Math.max(0, Math.ceil(sorted.length * q) - 1)] ?? 0;
  return [at(0.25), at(0.5), at(0.75)];
}

/** Shortest quarter gets the strongest colour (4), longest gets 1. */
export function heatmapLevelFor(
  charCount: number,
  [q1, q2, q3]: [number, number, number],
): 1 | 2 | 3 | 4 {
  if (charCount <= q1) return 4;
  if (charCount <= q2) return 3;
  if (charCount <= q3) return 2;
  return 1;
}

function buildHeatmap(dailies: Solution[]): Analytics["heatmap"] {
  const charByDate = new Map<string, number>();
  for (const d of dailies) {
    if (!isSolved(d)) continue;
    // Only record real character counts — never invent a default of 200
    if (typeof d.characters !== "number" || !Number.isFinite(d.characters)) continue;
    const key = solutionDateKey(d);
    if (!key) continue;
    charByDate.set(key, d.characters);
  }

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  // Adaptive window: anchor to the user's actual data range rather than a
  // fixed 365 days. For <1yr of history this fills the grid with the streak
  // instead of a sea of empty cells; a full-year user still gets the year.
  let firstSolved: Date | null = null;
  for (const key of charByDate.keys()) {
    const d = parseDate(key);
    if (!isValidDate(d)) continue;
    if (!firstSolved || d < firstSolved) firstSolved = d;
  }

  // No solved dailies → no activity grid. Returning empty (instead of a
  // yearAgo-fallback window of level-0 cells) keeps the heatmap honest and
  // lets the UI show its "no activity yet" empty state.
  if (!firstSolved) return [];

  const yearAgo = addCalendarDays(today, -364);
  const windowStart = firstSolved < yearAgo ? yearAgo : firstSolved;

  // Snap to the Sunday on/before the window start so the grid's first column
  // is always a full week (no off-by-one partial week at the left edge).
  const snapped = addCalendarDays(windowStart, -windowStart.getUTCDay());

  const thresholds = heatmapThresholds([...charByDate.values()]);
  const out: Analytics["heatmap"] = [];
  for (let d = snapped; d <= today; d = addCalendarDays(d, 1)) {
    const key = formatDate(d);
    const c = charByDate.get(key);
    out.push({ date: key, level: c != null ? heatmapLevelFor(c, thresholds) : 0 });
  }
  return out;
}

function buildMonthly(dailies: Solution[]): Analytics["monthly"] {
  const map = new Map<string, Solution[]>();
  for (const d of dailies) {
    if (!isSolved(d)) continue;
    const date = parseDate(d.date);
    if (!isValidDate(date)) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
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
