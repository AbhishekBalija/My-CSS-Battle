/**
 * Date helpers for CSSBattle daily keys (UTC calendar dates, `YYYY-MM-DD`).
 * Always parse/format in UTC so streaks, heatmaps, and timelines stay stable
 * across timezones and DST transitions.
 */

export function isValidDate(date: Date): boolean {
  return Number.isFinite(date.getTime());
}

/**
 * Parse a date string as a UTC calendar day.
 * - `YYYY-MM-DD` → UTC midnight that day
 * - empty / invalid → Invalid Date (callers should check `isValidDate`)
 */
export function parseDate(dateStr: string): Date {
  if (!dateStr?.trim()) return new Date(NaN);

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
      return new Date(NaN);
    }
    if (m < 1 || m > 12 || d < 1 || d > 31) return new Date(NaN);
    return new Date(Date.UTC(y, m - 1, d));
  }

  const date = new Date(dateStr);
  if (!isValidDate(date)) return new Date(NaN);
  return date;
}

/** Current UTC calendar day as `YYYY-MM-DD`. */
export function getUtcTodayKey(): string {
  const now = new Date();
  return formatDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  );
}

/** Format a Date as a UTC `YYYY-MM-DD` key. Returns "" for invalid dates. */
export function formatDate(date: Date): string {
  if (!isValidDate(date)) return "";
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole calendar-day difference (b − a) in UTC, DST-safe. */
export function calendarDaysBetween(a: Date, b: Date): number {
  if (!isValidDate(a) || !isValidDate(b)) return NaN;
  const aUTC = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const bUTC = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((bUTC - aUTC) / 86_400_000);
}

/** Add whole calendar days in UTC. */
export function addCalendarDays(date: Date, days: number): Date {
  if (!isValidDate(date)) return new Date(NaN);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days),
  );
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";

  const date = parseDate(dateStr);
  if (!isValidDate(date)) return "";

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr);
  if (!isValidDate(date)) return "";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}
