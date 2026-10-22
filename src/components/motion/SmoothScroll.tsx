import { useCallback, useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { useReducedMotion } from "motion/react";
import { ScrollTopContext } from "./scroll-top";

/**
 * Momentum page scrolling with Lenis. Lenis eases the real window scroll, so
 * position: sticky, scroll listeners and motion's useScroll keep working.
 * Off for people who prefer reduced motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);
  const enabled = !reduced;

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      // How much of the remaining distance the page covers each frame.
      // 0.18 felt right in testing: smooth but no felt delay on a trackpad.
      lerp: 0.18,
      // Horizontal strips (the daily target strip) keep native scrolling
      gestureOrientation: "vertical",
      allowNestedScroll: true,
      anchors: true,
    });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  // Stable so effects that depend on it don't re-run every render
  const scrollToTop = useCallback(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, []);

  return <ScrollTopContext.Provider value={scrollToTop}>{children}</ScrollTopContext.Provider>;
}
