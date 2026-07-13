import type { Solution, Profile } from '../types';
import battleSolutionsData from '../../data/battles.json';
import profileData from '../../content/profile.json';
import { parseDate, formatDate } from './dates';

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
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Daily Target — ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function getDailyTargets() {
  return solutions
    .filter(s => s.type === 'daily')
    .sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());
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

export function getDailyTimeline() {
  const dailies = getDailyTargets();
  if (dailies.length === 0) {
    return { today: null, yesterday: null, tomorrow: null, past: [], all: [] };
  }

  const todayEntry = dailies[dailies.length - 1];
  const todayDate = parseDate(todayEntry.date);

  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayEntry = dailies.find(d => formatDate(parseDate(d.date)) === formatDate(yesterdayDate)) || null;

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatDate(tomorrowDate);

  const past = dailies.filter(d => {
    const diff = (todayDate.getTime() - parseDate(d.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 2;
  });

  return {
    today: todayEntry,
    yesterday: yesterdayEntry,
    tomorrow: { date: tomorrowStr, locked: true },
    past,
    all: dailies,
  };
}

export function getNextMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}
