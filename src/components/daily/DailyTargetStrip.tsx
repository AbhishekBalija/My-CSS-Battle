import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";
import DailyCard from "./DailyCard";
import { getDailyTimeline } from "@/lib/data";
import VoiceLine from "../VoiceLine";
import { Highlighter } from "../ui/highlighter";

export default function DailyTargetsStrip() {
  const timeline = getDailyTimeline();
  const { today, yesterday, tomorrow, past } = timeline;

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [canLeft, setCanLeft] = useState(true);

  // On mount, center today's card in the viewport.
  useEffect(() => {
    const el = scrollRef.current;
    const today = todayRef.current;
    if (!el || !today) return;

    const centerToday = () => {
      const target =
        today.offsetLeft + today.offsetWidth / 2 - el.clientWidth / 2;
      // Instant jump on load; restore smooth scrolling after.
      el.style.scrollBehavior = "auto";
      el.scrollLeft = Math.max(0, target);
      requestAnimationFrame(() => {
        el.style.scrollBehavior = "";
      });
      setCanLeft(el.scrollLeft > 1);
    };

    const raf = requestAnimationFrame(centerToday);
    // Re-measure after webfonts / images settle.
    const t1 = setTimeout(centerToday, 80);
    const t2 = setTimeout(centerToday, 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(scrollTimer.current);
    };
  }, []);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const left = el.scrollLeft;
    setCanLeft(left > 1);

    // Reveal the scrollbar only while the user is actively scrolling.
    el.classList.add("is-scrolling");
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      el.classList.remove("is-scrolling");
    }, 750);
  };

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Daily Targets
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              <VoiceLine>
                One a day,{" "}
                <Highlighter
                  action="underline"
                  color="oklch(0.7838 0.1505 58.24 / 30%)"
                  animationDuration={800}
                  isView
                >
                  every day.
                </Highlighter>
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

      {/* Cards strip */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-auto relative overflow-x-auto scroll-smooth px-4 sm:px-6 pb-4 sm:pb-6 pt-2"
        style={{
          boxShadow: canLeft
            ? "inset 70px 0 50px -35px var(--scroll-shadow)"
            : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div className="flex items-center gap-4 py-2 min-w-min">
          {past.map((sol, i) => (
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
              date={today?.date}
            />
          </div>
          <DailyCard
            solution={undefined}
            state="tomorrow"
            date={tomorrow?.date}
          />
        </div>
      </div>
    </section>
  );
}
