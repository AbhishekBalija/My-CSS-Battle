export const BATTLES_PER_PAGE = 24;
export const DAILY_PER_PAGE = 28;

export function getTotalPages(totalItems: number, perPage: number): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / perPage);
}

export function getPageSlice<T>(items: T[], page: number, perPage: number): T[] {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, totalPages);
}
