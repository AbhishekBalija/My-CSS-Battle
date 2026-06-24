import { Link } from "react-router-dom";
import { Check, Lock, BookOpen } from "lucide-react";
import TargetImage from "@/components/ui/TargetImage";
import { ShineBorder } from "@/components/ui/shine-border";
import CountdownTimer from "./CountdownTimer";
import { formatDateLabel } from "@/lib/dates";
import type { Solution } from "../../types";

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
        <div className="bg-muted/10 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_var(--accent-glow)]">
          {/* Badge header */}
          <div className={headerClasses}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/40 rounded-full">
              <span className="font-mono text-[9px] sm:text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
                Tomorrow
              </span>
            </span>
          </div>
          {/* Content - noise/static with lock */}
          <div className="aspect-4/3 relative flex items-center justify-center bg-muted/5">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 1px, hsl(0 0% 20%) 1px, hsl(0 0% 20%) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, hsl(0 0% 15%) 1px, hsl(0 0% 15%) 2px)",
              }}
            />
            <Lock className="w-6 h-6 text-muted-foreground/50 relative z-10" />
          </div>
          {/* Footer */}
          <div className={`${footerClasses} flex-col gap-0.5`}>
            <span className="font-mono text-[9px] text-muted-foreground/60">
              Unlocks in
            </span>
            <CountdownTimer />
          </div>
        </div>
      </div>
    );
  }

  // --- Unsolved ---
  if (!isSolved) {
    return (
      <div
        className={`${sizeClasses} ${opacityClasses} transition-all duration-300 hover:opacity-100`}
      >
        <div className="bg-muted/10 border border-border rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_var(--accent-glow)]">
          <div className={headerClasses}>
            <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground">
              {dateLabel}
            </span>
          </div>
          <div className="aspect-4/3 bg-muted/5" />
          <div className={footerClasses}>
            <span className="font-mono text-[9px] text-muted-foreground/50">
              not solved yet
            </span>
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
        className={`bg-card rounded-lg relative transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_50px_-12px_var(--accent-glow)] ${
          isToday
            ? "overflow-visible"
            : "border border-border overflow-hidden group-hover:border-primary/60"
        }`}
      >
        {isToday && (
          <ShineBorder
            shineColor="var(--shine-color)"
            borderWidth={2}
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
            <span className="font-mono text-[9px] sm:text-[10px] font-medium text-foreground">
              {dateLabel}
            </span>
            {isToday && (
              <span className="font-mono text-[9px] sm:text-[10px] font-semibold text-primary">
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
            <span className="font-mono text-[9px] text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
              Your score
            </span>
            <BookOpen className="w-3 h-3 text-muted-foreground/40 transition-colors duration-300 group-hover:text-primary/70" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xs sm:text-sm font-medium text-foreground tabular-nums">
              {solution.score?.toFixed(2)}
            </span>
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{`{${solution.characters}}`}</span>
          </div>
        </div>
        </div>
      </div>
    </Link>
  );
}
