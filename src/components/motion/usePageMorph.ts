import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Wraps in-site link clicks in a View Transition, so a card's target image
 * morphs into the same image on the next page (both carry the same
 * view-transition-name) and everything else crossfades.
 *
 * BrowserRouter ignores Link's `viewTransition` prop (that only works with
 * data routers), so we catch the click ourselves, before React Router does.
 */
// Nav order decides slide direction: moving right in the nav slides left
const NAV_ORDER = ["/", "/daily", "/battles", "/analytics"];

function navIndex(pathname: string): number {
  if (pathname.startsWith("/solutions")) return NAV_ORDER.length; // deeper than any tab
  const index = NAV_ORDER.findIndex((path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path),
  );
  return index === -1 ? 0 : index;
}

/** The solution id whose image should morph: the one being opened or left. */
function morphIdFor(fromPath: string, toPath: string): string | null {
  const match = toPath.match(/^\/solutions\/([^/]+)/) ?? fromPath.match(/^\/solutions\/([^/]+)/);
  return match ? decodeURIComponent(match[1]!) : null;
}

/** Marks the one visible image with this id (duplicate names would abort the transition). */
function markMorph(id: string | null) {
  if (!id) return;
  const candidates = document.querySelectorAll<HTMLElement>(`[data-morph="${CSS.escape(id)}"]`);
  const visible = [...candidates].find((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
  });
  (visible ?? candidates[0])?.classList.add("vt-active");
}

function clearMorph() {
  document.querySelectorAll(".vt-active").forEach((el) => el.classList.remove("vt-active"));
}

export function usePageMorph(onNavigated: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const to = url.pathname + url.search + url.hash;
      if (to === window.location.pathname + window.location.search + window.location.hash) return;

      // React Router's Link skips its own navigation when the click is already
      // prevented, while other onClick handlers (like closing the mobile menu)
      // still run. We navigate inside the transition instead.
      event.preventDefault();

      const root = document.documentElement;
      root.dataset.navDir =
        navIndex(url.pathname) >= navIndex(window.location.pathname) ? "forward" : "back";

      const morphId = morphIdFor(window.location.pathname, url.pathname);
      markMorph(morphId); // in the old page, before the snapshot

      const transition = document.startViewTransition(async () => {
        clearMorph();
        navigate(to);
        await waitForRoute(url.pathname);
        onNavigated();
        markMorph(morphId); // in the new page
      });
      // A skipped transition (hidden tab, quick double click) rejects; that's fine
      transition.ready.catch(() => {});
      transition.finished.finally(() => {
        delete root.dataset.navDir;
        clearMorph();
      });
    }

    // Capture phase so we run before React's handler on the root
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate, onNavigated]);
}

/**
 * Resolves once the new route has rendered (or after a short cap).
 * Polls with setTimeout, not requestAnimationFrame: the browser pauses
 * frames while a View Transition waits for this, so rAF would never fire.
 */
function waitForRoute(pathname: string): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      const routeShown = document.querySelector(`[data-route="${CSS.escape(pathname)}"]`);
      if (routeShown || performance.now() - started > 400) resolve();
      else setTimeout(check, 16);
    };
    check();
  });
}
