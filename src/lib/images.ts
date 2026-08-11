import { targetImageMap } from "@/generated/target-images";
import { BASE_URL } from "@/lib/seo";
import type { Solution } from "@/types";

/**
 * Returns the best image URL for display in the UI.
 * Prefers a locally downloaded copy (relative path) so it works in both
 * development and production, and falls back to the external target URL.
 */
export function getSolutionImageUrl(solution: Solution): string {
  const local = targetImageMap[solution.id];
  if (local) {
    return local;
  }
  return solution.targetImage || `${BASE_URL}/og-image.svg`;
}

/**
 * Returns an absolute image URL for Open Graph / Twitter metadata.
 */
export function getSolutionOgImageUrl(solution: Solution): string {
  const local = targetImageMap[solution.id];
  if (local) {
    return `${BASE_URL}${local}`;
  }
  return solution.targetImage || `${BASE_URL}/og-image.svg`;
}

export function getOgImageDimensions(imageUrl: string): {
  width: number;
  height: number;
  type: string;
} {
  if (imageUrl.endsWith(".svg")) {
    return { width: 1200, height: 630, type: "image/svg+xml" };
  }
  return { width: 400, height: 300, type: "image/png" };
}
