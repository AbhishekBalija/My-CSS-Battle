import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionProps,
  type UseInViewOptions,
  type Variants,
} from "motion/react";


type MarginType = UseInViewOptions["margin"];

interface BlurFadeProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
}

const getFilter = (v: Variants[string]) =>
  typeof v === "function" ? undefined : v.filter;

/**
 * Scroll-driven version: the block rises and fades in as it travels up the
 * screen, tied to the scroll position (not a timer), smoothed by a spring so
 * it settles softly. Anything already on screen at load is fully shown.
 */
function ScrollReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mountedAt = useRef(0);
  useEffect(() => {
    mountedAt.current = performance.now();
  }, []);
  const settled = useRef(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when the block's top touches the bottom of the screen,
    // 1 once its top reaches 75% of the way up
    offset: ["start end", "start 0.75"],
  });

  // One-way: follows your scroll on the way in, but never slides back out.
  // Blocks near the end of the page can't scroll up to the 75% line, so
  // reaching the bottom of the page finishes them.
  const furthest = useRef(0);
  const reached = useTransform(scrollYProgress, (v) => {
    // Also runs during server prerender, where there is no window
    if (typeof window === "undefined") return v;
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    furthest.current = Math.max(furthest.current, atBottom && v > 0 ? 1 : v);
    return furthest.current;
  });
  const progress = useSpring(reached, { stiffness: 140, damping: 26, mass: 0.6 });
  const y = useTransform(progress, [0, 1], [56, 0]);
  const scale = useTransform(progress, [0, 1], [0.96, 1]);
  const opacity = useTransform(progress, [0, 0.6], [0, 1]);

  // Already on screen when the page opens: show it straight away
  useMotionValueEvent(reached, "change", (v) => {
    if (v >= 1 && performance.now() - mountedAt.current < 150) progress.jump(1);
  });

  // Tell things that measure their position (like Highlighter) it's safe now
  useMotionValueEvent(progress, "change", (v) => {
    const el = ref.current;
    if (settled.current || !el || v < 0.995) return;
    settled.current = true;
    el.setAttribute("data-settled", "");
    el.dispatchEvent(new Event("reveal-settled"));
  });

  return (
    <motion.div ref={ref} data-reveal="" style={{ y, scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Light version for touch devices: no per-frame JavaScript. When the block
 * first scrolls into view it gets data-shown, and a CSS spring transition
 * (translate/scale/opacity, GPU-run) does the rest. See .reveal-lite in index.css.
 */
function LiteReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const settle = () => {
      el.setAttribute("data-settled", "");
      el.dispatchEvent(new Event("reveal-settled"));
    };
    const rect = el.getBoundingClientRect();
    // Already on screen when the page opens: show it straight away
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.setAttribute("data-shown", "instant");
      settle();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        // Opacity finishes first; wait for the movement to end
        const onEnd = (event: TransitionEvent) => {
          if (event.propertyName !== "translate") return;
          el.removeEventListener("transitionend", onEnd);
          settle();
        };
        el.addEventListener("transitionend", onEnd);
        el.setAttribute("data-shown", "");
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" className={`reveal-lite ${className ?? ""}`}>
      {children}
    </div>
  );
}

/** Touch screens (phones, tablets) get the light reveal. */
function useCoarsePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(pointer: coarse)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

export function BlurFade(props: BlurFadeProps) {
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  if (reduced) return <TimedBlurFade {...props} />;
  if (coarse) return <LiteReveal className={props.className}>{props.children}</LiteReveal>;
  return <ScrollReveal className={props.className}>{props.children}</ScrollReveal>;
}

function TimedBlurFade({
  children,
  className,
  variant,
  duration = 0.3,
  delay = 0,
  offset = 4,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "3px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  };
  const combinedVariants = variant ?? defaultVariants;

  const hiddenFilter = getFilter(combinedVariants.hidden);
  const visibleFilter = getFilter(combinedVariants.visible);

  const shouldTransitionFilter =
    hiddenFilter != null &&
    visibleFilter != null &&
    hiddenFilter !== visibleFilter;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration,
          ease: "easeOut",
          ...(shouldTransitionFilter ? { filter: { duration } } : {}),
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
