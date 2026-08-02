import { Link } from "react-router-dom";
import { Check, Lock, BookOpen, Target, ArrowUpRight } from "lucide-react";
import TargetImage from "@/components/ui/TargetImage";
import { ShineBorder } from "@/components/ui/shine-border";
import CountdownTimer from "./CountdownTimer";
import { formatDateLabel } from "@/lib/dates";
import type { Solution } from "../../types";

// Thin horizontal glitch slices. Each clips to a ~4% band of the card and
// slides sideways on its own random-looking steps() cycle (different
// keyframe + delay so they never sync up).
const GLITCH_SLICES: { anim: string; top: number; delay: number }[] = [
  { anim: "animate-glitch-slice-1", top: 4, delay: 0 },
  { anim: "animate-glitch-slice-2", top: 10, delay: 0.3 },
  { anim: "animate-glitch-slice-3", top: 16, delay: 0.6 },
  { anim: "animate-glitch-slice-1", top: 22, delay: 0.9 },
  { anim: "animate-glitch-slice-2", top: 30, delay: 0.15 },
  { anim: "animate-glitch-slice-3", top: 37, delay: 0.5 },
  { anim: "animate-glitch-slice-1", top: 44, delay: 0.75 },
  { anim: "animate-glitch-slice-2", top: 52, delay: 1.1 },
  { anim: "animate-glitch-slice-3", top: 58, delay: 0.2 },
  { anim: "animate-glitch-slice-1", top: 65, delay: 0.65 },
  { anim: "animate-glitch-slice-2", top: 72, delay: 1.3 },
  { anim: "animate-glitch-slice-3", top: 79, delay: 0.4 },
  { anim: "animate-glitch-slice-1", top: 92, delay: 1.0 },
];

interface DailyCardProps {
  solution?: Solution & { solved?: boolean };
  state: "today" | "yesterday" | "tomorrow" | "far-past";
  date?: string;
  layout?: "strip" | "grid";
}

export default function DailyCard({ solution, state, date, layout = "strip" }: DailyCardProps) {
  const isToday = state === "today";
  const isTomorrow = state === "tomorrow";
  const isFarPast = state === "far-past";

  // A solution is considered solved if it has a score
  const isSolved = solution && solution.score && solution.score > 0;

  const dateStr = solution?.date || date;
  const dateLabel = dateStr ? formatDateLabel(dateStr) : "";

  const opacityClasses = isFarPast
    ? "opacity-60"
    : state === "yesterday"
      ? "opacity-80"
      : "opacity-100";

  // Shared layout constants so every variant renders at the same size.
  const sizeClasses = layout === "grid" ? "w-full" : "w-[220px] sm:w-[260px] shrink-0";
  const headerClasses = "px-2 h-8 flex items-center justify-center";
  const footerClasses = "px-2 h-12 flex items-center justify-center";

  // --- Tomorrow (locked) ---
  if (isTomorrow) {
    return (
      <div
        className={`${sizeClasses} ${opacityClasses} transition-all duration-300 hover:opacity-100`}
      >
        <div className="bg-muted/10 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
          {/* Badge header */}
          <div className={headerClasses}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/40 rounded-full">
              <span className="font-mono text-[11px] sm:text-xs font-medium text-muted-foreground tracking-wider uppercase">
                Tomorrow
              </span>
            </span>
          </div>
          {/* Content - TV test pattern that glitches (sliced displacement) */}
          <div className="aspect-4/3 relative overflow-hidden bg-muted/5">
            {/* Glitch base — eager + high priority: it's the LCP element on
                the home page, so lazy-loading it delays first paint. */}
            <img
              src="https://cssbattle.dev/images/tv-glitch.png"
              alt=""
              aria-hidden
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover animate-tv-flicker"
            />
            {/* Torn slices — thin horizontal lines, each sliding sideways on
                its own random-looking steps() cycle. */}
            {GLITCH_SLICES.map((s) => (
              <div
                key={`${s.anim}-${s.top}`}
                className={`absolute inset-0 ${s.anim}`}
                style={{
                  backgroundImage:
                    "url(https://cssbattle.dev/images/tv-glitch.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  clipPath: `inset(${s.top}% 0 ${100 - s.top - 4}% 0)`,
                  animationDelay: `${s.delay}s`,
                }}
              />
            ))}
            {/* Big jagged tear line near the bottom (sync error) */}
            <div
              className="absolute inset-0 animate-glitch-tear"
              style={{
                backgroundImage:
                  "url(https://cssbattle.dev/images/tv-glitch.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                clipPath: "inset(86% 0 10% 0)",
              }}
            />
            {/* Static noise + scanlines + center lock */}
            <div className="absolute inset-0 tv-noise" />
            <div className="absolute inset-0 tv-scanlines" />
            {/* Scrim so the lock stays readable over the bright bars */}
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white/85 drop-shadow" />
            </div>
          </div>
          {/* Footer */}
          <div className={`${footerClasses} flex-col gap-0.5`}>
            <span className="font-mono text-[11px] text-muted-foreground/80">
              Unlocks in
            </span>
            <CountdownTimer />
          </div>
        </div>
      </div>
    );
  }

  // --- Today: target is live on cssbattle.dev but not synced/solved yet ---
  if (isToday && !solution) {
    return (
      <a
        href="https://cssbattle.dev"
        target="_blank"
        rel="noopener noreferrer"
        className={`${sizeClasses} ${opacityClasses} transition-all duration-300 hover:opacity-100 group block`}
      >
        <div className="bg-muted/10 border border-primary/40 rounded-lg overflow-hidden transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/60">
          <div className={headerClasses}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 rounded-full">
              <span className="font-mono text-[11px] sm:text-xs font-medium text-foreground">
                {dateLabel}
              </span>
              <span className="font-mono text-[11px] sm:text-xs font-semibold text-primary">
                (TODAY)
              </span>
            </span>
          </div>
          <div className="aspect-4/3 relative flex items-center justify-center bg-muted/5">
            <Target className="w-6 h-6 text-primary/70 animate-pulse" />
          </div>
          <div className={`${footerClasses} flex-col gap-0.5`}>
            <span className="font-mono text-[11px] text-primary/80">
              new target is out · not solved yet
            </span>
            <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground/70 transition-colors duration-300 group-hover:text-muted-foreground">
              solve it on cssbattle.dev
              <ArrowUpRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      </a>
    );
  }

  // --- Unsolved ---
  if (!isSolved) {
    const isYesterdayMissed = state === "yesterday";
    return (
      <div
        className={`${sizeClasses} ${opacityClasses} transition-all duration-300 hover:opacity-100`}
      >
        <div
          className={`bg-muted/10 border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-0.5 ${
            isYesterdayMissed
              ? "border-warn/40 hover:border-warn/60"
              : "border-border hover:border-primary/40"
          }`}
        >
          <div className={headerClasses}>
            <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">
              {dateLabel}
            </span>
          </div>
          <div className="aspect-4/3 bg-muted/5" />
          <div className={`${footerClasses} flex-col gap-0.5`}>
            <span className="font-mono text-[11px] text-muted-foreground/50">
              {isYesterdayMissed
                ? "still staring at it?"
                : "not solved yet"}
            </span>
            {isYesterdayMissed && (
              <span className="font-mono text-[11px] text-warn/80">
                window closed
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Solved (today / yesterday / past) ---
  return (
    <Link
      to={`/solutions/${solution.id}`}
      className={`${sizeClasses} ${opacityClasses} transition-all duration-300 hover:opacity-100 group block`}
    >
      <div
        className={`bg-card rounded-lg relative transition-all duration-300 group-hover:-translate-y-0.5 ${
          isToday
            ? "overflow-visible"
            : "border border-border overflow-hidden group-hover:border-primary/60"
        }`}
      >
        {isToday && (
          <ShineBorder
            shineColor="var(--shine-color)"
            borderWidth={2.5}
            duration={8}
            className="rounded-lg z-20"
          />
        )}
        <div className="rounded-lg overflow-hidden">
        {/* Badge header */}
        <div className={headerClasses}>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
              isToday ? "bg-primary/15" : "bg-primary/10"
            }`}
          >
            <Check className="w-2.5 h-2.5 text-primary" />
            <span className="font-mono text-[11px] sm:text-xs font-medium text-foreground">
              {dateLabel}
            </span>
            {isToday && (
              <span className="font-mono text-[11px] sm:text-xs font-semibold text-primary">
                (TODAY)
              </span>
            )}
          </span>
        </div>
        {/* Target image */}
        <div className="aspect-4/3 overflow-hidden border-y border-border/40">
          <TargetImage
            src={solution.targetImage}
            colors={solution.colors}
            alt={solution.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
          />
        </div>
        {/* Footer - always show for solved cards */}
        <div className={`${footerClasses} flex-col items-start gap-0.5 py-1.5`}>
          <div className="flex items-center justify-between w-full">
            <span className="font-mono text-[11px] text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
              Your score
            </span>
            <BookOpen className="w-3 h-3 text-muted-foreground/40 transition-colors duration-300 group-hover:text-primary/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-foreground tabular-nums">
              {solution.score?.toFixed(2)}
            </span>
            <span className="font-mono text-[11px] sm:text-xs text-muted-foreground">{`{${solution.characters}}`}</span>
          </div>
        </div>
        </div>
      </div>
    </Link>
  );
}
