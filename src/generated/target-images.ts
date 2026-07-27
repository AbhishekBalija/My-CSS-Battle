// Fallback map for fresh checkouts. The production build regenerates this file
// after downloading locally cached target images.
export const targetImageMap: Record<string, string> = {};

export function getTargetImageUrl(id: string, fallback?: string): string {
  return targetImageMap[id] ?? fallback ?? "";
}
