import type { Solution, Profile, ProfileHistoryEntry } from '../types';
import battleSolutionsData from '../../data/battles.json';
import profileData from '../../content/profile.json';
import profileHistoryData from '../../content/profileHistory.json';

// Auto-import all daily solution files (month-wise under data/daily/<year>/).
// New month files are picked up automatically — no need to modify this file.
const dailyModules = import.meta.glob('../../data/daily/**/*.json', { eager: true, import: 'default' });
const dailySolutionsData: Solution[] = Object.values(dailyModules)
  .flat() as Solution[];

export const solutions = [...dailySolutionsData, ...battleSolutionsData] as Solution[];
export const profile: Profile = profileData;
export const profileHistory: ProfileHistoryEntry[] = profileHistoryData;

export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Try YYYY-MM-DD format first
  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  
  // Try "Mon DD, YYYY" format (e.g., "Jun 1, 2026")
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  return new Date();
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  
  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return '';
  
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getDailyTargets() {
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

export function getBattlesGrouped() {
  const battles: Record<number, (Solution & { type: 'battle'; battleNumber: number })[]> = {};
  solutions
    .filter((s): s is Solution & { type: 'battle'; battleNumber: number } =>
      s.type === 'battle' && s.battleNumber !== undefined
    )
    .forEach(s => {
      if (!battles[s.battleNumber]) battles[s.battleNumber] = [];
      battles[s.battleNumber].push(s);
    });

  return Object.entries(battles)
    .map(([num, targets]) => ({
      battleNumber: parseInt(num),
      targets: targets.sort((a, b) => a.battleNumber - b.battleNumber)
    }))
    .sort((a, b) => a.battleNumber - b.battleNumber);
}

export function getSolutionById(id: string): Solution | undefined {
  return solutions.find(s => s.id === id);
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

export function detectTechniques(code: string): Array<{ label: string }> {
  if (!code) return [{ label: "something else" }];
  const tags: Array<{ label: string }> = [];
  const lower = code.toLowerCase();
  const pCount = (code.match(/<p/g) || []).length;
  const hasNested = /&\{.*\*\{|&\{.*\{[^}]*\}/.test(code);
  const hasAmpBody = /&\{|body\{/.test(lower);
  const hasGradient = /gradient/.test(lower);

  // --- Primary approach (how the solution is structured) ---
  if (pCount >= 2) {
    tags.push({ label: "multi-element" });
  } else if (hasNested) {
    tags.push({ label: "nested template" });
  } else if (hasAmpBody && hasGradient && pCount === 0) {
    tags.push({ label: "all gradient" });
  } else if (hasAmpBody) {
    tags.push({ label: "& selector" });
  } else if (pCount === 1) {
    tags.push({ label: "single element" });
  } else {
    tags.push({ label: "something else" });
  }

  // --- Gradient types (his signature) ---
  if (lower.includes("conic-gradient")) tags.push({ label: "conic" });
  if (lower.includes("radial-gradient")) tags.push({ label: "radial" });
  if (lower.includes("linear-gradient")) tags.push({ label: "linear" });

  // --- Shape & positioning tools ---
  if (lower.includes("border-radius") || lower.includes("corner-shape"))
    tags.push({ label: "border-radius" });
  if (lower.includes("box-shadow")) tags.push({ label: "box-shadow" });
  if (lower.includes("transform") || lower.includes("rotate") || lower.includes("translate") || lower.includes("scale"))
    tags.push({ label: "transform" });
  if (lower.includes("margin:") && code.match(/\d+\s+\d+/))
    tags.push({ label: "margin positioning" });
  if (lower.includes("inset")) tags.push({ label: "inset" });

  // --- Utilities ---
  if (lower.includes("--")) tags.push({ label: "css vars" });
  if (lower.includes("calc(")) tags.push({ label: "calc()" });

  // --- Rare / avoided (only when actually used) ---
  if (lower.includes("clip-path")) tags.push({ label: "clip-path" });
  if (lower.includes("flex")) tags.push({ label: "flexbox" });
  if (lower.includes("grid")) tags.push({ label: "grid" });

  return tags;
}

export function getNextMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}