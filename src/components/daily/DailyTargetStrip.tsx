import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import DailyCard from "./DailyCard";
import { getDailyTimeline } from "@/lib/data";
import VoiceLine from "../VoiceLine";
import { Highlighter } from "../ui/highlighter";

// Only the newest past cards go into the first render (and the prerendered
// HTML). Older ones are added in batches as you scroll left, so the homepage
// stays small even with hundreds of dailies.
const PAST_BATCH = 30;
// How close to the left edge (px) before the next batch is added
const LOAD_MORE_MARGIN = "0px 0px 0px 800px";

export default function DailyTargetsStrip() {
  const timeline = getDailyTimeline();
  const { today, yesterday, tomorrow, past, todayKey } = timeline;

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const scrollRaf = useRef<number | undefined>(undefined);
  const [canLeft, setCanLeft] = useState(false);
  const [pastCount, setPastCount] = useState(PAST_BATCH);
  const visiblePast = past.slice(-pastCount);
  const hasOlder = pastCount < past.length;
  // Strip width before a batch is added, so the view can stay put after it
  const widthBeforeLoad = useRef<number | null>(null);
  // Empty marker before the first card; seeing it means "load older cards"
  const olderMarkerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRef.current;
    const marker = olderMarkerRef.current;
    if (!root || !marker || !hasOlder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || widthBeforeLoad.current !== null) return;
        widthBeforeLoad.current = root.scrollWidth;
        setPastCount((count) => count + PAST_BATCH);
      },
      { root, rootMargin: LOAD_MORE_MARGIN },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [hasOlder, pastCount]);

  // Adding cards on the left pushes everything right. Shift the scroll by the
  // added width so the cards you were looking at do not jump.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const before = widthBeforeLoad.current;
    if (!el || before === null) return;
    widthBeforeLoad.current = null;
    el.style.scrollBehavior = "auto";
    el.scrollLeft += el.scrollWidth - before;
    el.style.scrollBehavior = "";
  }, [pastCount]);

  const updateScrollState = (el: HTMLDivElement) => {
    setCanLeft(el.scrollLeft > 1);
  };

  // On mount, center today's card in the viewport.
  useEffect(() => {
    const el = scrollRef.current;
    const today = todayRef.current;
    if (!el || !today) return;

    const centerToday = () => {
      const target =
        today.offsetLeft + today.offsetWidth / 2 - el.clientWidth / 2;
      el.style.scrollBehavior = "auto";
      el.scrollLeft = Math.max(0, target);
      requestAnimationFrame(() => {
        el.style.scrollBehavior = "";
      });
      updateScrollState(el);
    };

    const raf = requestAnimationFrame(centerToday);
    const t1 = setTimeout(centerToday, 80);
    const t2 = setTimeout(centerToday, 250);
    // Re-center if the viewport resizes (rotate / mobile URL bar) so today's
    // card doesn't drift off-center.
    window.addEventListener("resize", centerToday);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(scrollTimer.current);
      if (scrollRaf.current !== undefined) cancelAnimationFrame(scrollRaf.current);
      window.removeEventListener("resize", centerToday);
    };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (scrollRaf.current !== undefined) return;
    scrollRaf.current = requestAnimationFrame(() => {
      scrollRaf.current = undefined;
      updateScrollState(el);

      el.classList.add("is-scrolling");
      clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        el.classList.remove("is-scrolling");
      }, 750);
    });
  };

  return (
    <section>
      {/* Header — flat, editorial. The timeline below carries the structure. */}
      <div className="flex items-start justify-between gap-4 pb-3 sm:pb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Daily Targets
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              <VoiceLine as="span">
                One a day,{" "}
                <Highlighter
                  action="underline"
                  color="var(--highlight-underline)"
                  animationDuration={800}
                  isView
                >
                  every day.
                </Highlighter>{" "}
                No leaderboards, just the puzzle.
              </VoiceLine>
            </p>
          </div>
        </div>
        <Link
          to="/daily"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground rounded-full transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Timeline strip — a real chronological line, not another boxed card. */}
      <div className="hairline rounded-lg overflow-hidden relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-auto overflow-x-auto scroll-smooth px-4 sm:px-6 pb-4 sm:pb-6 pt-2"
        >
          <div className="flex items-center gap-4 py-2 min-w-min">
            {hasOlder && <div ref={olderMarkerRef} className="w-px self-stretch shrink-0" aria-hidden="true" />}
            {visiblePast.map((sol, i) => (
              <DailyCard
                key={sol?.id || `past-${i}`}
                solution={sol}
                state="far-past"
                date={sol?.date}
              />
            ))}
            <DailyCard
              solution={yesterday || undefined}
              state="yesterday"
              date={yesterday?.date}
            />
            <div ref={todayRef} className="shrink-0">
              <DailyCard
                solution={today || undefined}
                state="today"
                date={today?.date ?? todayKey}
              />
            </div>
            <DailyCard
              solution={undefined}
              state="tomorrow"
              date={tomorrow?.date}
            />
          </div>
        </div>

        {/* Left edge fade — pinned to the wrapper (which never scrolls), so it
            always sits over the left edge of the visible strip and hints there's
            more content back there. Three-stop: solid → soft (same color, semi-
            transparent) → transparent, so the card reads as "cut off" then
            gently revealed, not just blurred. */}
        {canLeft && (
          <div className="absolute inset-y-0 left-0 w-20 bg-linear-to-r from-background via-background to-[#0000] pointer-events-none z-10" />
        )}
      </div>
    </section>
  );
}
