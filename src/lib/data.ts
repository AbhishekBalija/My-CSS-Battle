import type { Solution, Profile } from '../types';
import battleSolutionsData from '../../data/battles.json';
import profileData from '../../content/profile.json';
import {
  parseDate,
  formatDate,
  isValidDate,
  calendarDaysBetween,
  addCalendarDays,
  getUtcTodayKey,
} from './dates';

const dailyModules = import.meta.glob('../../data/daily/**/*.json', { eager: true, import: 'default' });
const dailySolutionsData = (Object.values(dailyModules).flat() as Solution[]).map((solution) =>
  solution.type === 'daily'
    ? { ...solution, name: getDailyTargetName(solution.date) }
    : solution
);

export const solutions = [...dailySolutionsData, ...battleSolutionsData] as Solution[];
export const profile: Profile = profileData;

function getDailyTargetName(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!isValidDate(date)) return 'Daily Target';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Daily Target — ${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function dateTime(dateStr: string): number {
  const t = parseDate(dateStr).getTime();
  return Number.isFinite(t) ? t : 0;
}

function getDailyTargets() {
  return solutions
    .filter(s => s.type === 'daily')
    .sort((a, b) => dateTime(a.date) - dateTime(b.date));
}

export function getBattleSolutions() {
  return solutions
    .filter((s): s is Solution & { type: 'battle'; battleNumber: number } =>
      s.type === 'battle' && s.battleNumber !== undefined
    )
    .sort((a, b) => a.battleNumber - b.battleNumber);
}

export function getSolutionById(id: string): Solution | undefined {
  return solutions.find(s => s.id === id);
}

export function getAdjacentSolutions(current: Solution): {
  previous: Solution | null;
  next: Solution | null;
} {
  const list =
    current.type === 'daily'
      ? getDailyTargets()
      : getBattleSolutions();

  const idx = list.findIndex(s => s.id === current.id);
  if (idx === -1) return { previous: null, next: null };

  return {
    previous: list[idx - 1] || null,
    next: list[idx + 1] || null,
  };
}

/**
 * Daily timeline anchored to the real UTC calendar day — not to the newest
 * data entry. When today's target is already live on cssbattle.dev but the
 * daily sync hasn't run yet, `today` is null (with `todayKey` set) so the UI
 * can show a "target is out" pending state instead of passing off
 * yesterday's target as today's. `latest` always points at the newest entry.
 */
export function getDailyTimeline() {
  const dailies = getDailyTargets();
  const todayKey = getUtcTodayKey();
  const todayDate = parseDate(todayKey);

  if (dailies.length === 0 || !isValidDate(todayDate)) {
    return {
      today: null,
      yesterday: null,
      tomorrow: null,
      past: [],
      all: dailies,
      latest: dailies[dailies.length - 1] ?? null,
      todayKey,
    };
  }

  const latest = dailies[dailies.length - 1];
  const latestDate = parseDate(latest.date);

  // Future-dated entry (bad data): anchor on it instead so it stays visible
  // rather than falling out of every bucket.
  const anchorDate =
    isValidDate(latestDate) && calendarDaysBetween(todayDate, latestDate) > 0
      ? latestDate
      : todayDate;

  const byDay = (key: string) =>
    dailies.find((d) => formatDate(parseDate(d.date)) === key) || null;

  const todayEntry = byDay(formatDate(anchorDate));
  const yesterdayEntry = byDay(formatDate(addCalendarDays(anchorDate, -1)));
  const tomorrowStr = formatDate(addCalendarDays(anchorDate, 1));

  // Calendar-day diff (not ms/86400000) so DST cannot mis-bucket "past"
  const past = dailies.filter((d) => {
    const dDate = parseDate(d.date);
    if (!isValidDate(dDate)) return false;
    return calendarDaysBetween(dDate, anchorDate) >= 2;
  });

  return {
    today: todayEntry,
    yesterday: yesterdayEntry,
    tomorrow: { date: tomorrowStr, locked: true },
    past,
    all: dailies,
    latest,
    todayKey,
  };
}

export function getNextMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}
