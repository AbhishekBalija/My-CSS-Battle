import { Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import VoiceLine from "@/components/VoiceLine";
import DailyCard from "@/components/daily/DailyCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { getDailyTimeline, formatDateFull } from "@/lib/data";

export default function Daily() {
  const timeline = getDailyTimeline();
  const { today, yesterday, past, all } = timeline;

  const solved = all.filter((s) => s.score && s.score > 0);
  const avgScore =
    solved.length > 0
      ? (solved.reduce((sum, s) => sum + (s.score || 0), 0) / solved.length).toFixed(1)
      : "—";
  const avgChars =
    solved.length > 0
      ? Math.round(solved.reduce((sum, s) => sum + (s.characters || 0), 0) / solved.length)
      : 0;

  const todayDate = today ? formatDateFull(today.date) : "";
  const cards = [
    { id: "today", solution: today || undefined, state: "today" as const, date: today?.date },
    { id: "yesterday", solution: yesterday || undefined, state: "yesterday" as const, date: yesterday?.date },
    ...[...past].reverse().map((sol) => ({
      id: sol?.id || `past-${sol?.date}`,
      solution: sol,
      state: "far-past" as const,
      date: sol?.date,
    })),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        <BlurFade delay={0.05} inView>
          <header>
            <h1 className="font-mono-tabular text-3xl tracking-tight text-foreground">
              Daily Targets
            </h1>
            <VoiceLine className="mt-2 text-sm">
              one a day, every day. no leaderboards, just the puzzle.
            </VoiceLine>
          </header>
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <div className="hairline flex flex-wrap items-center gap-4 sm:gap-6 rounded-lg bg-surface/40 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">today</span>
              <span className="font-mono-tabular text-xs text-foreground">
                {todayDate || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">solved</span>
              <span className="font-mono-tabular text-xs text-foreground">
                {solved.length}/{all.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">avg score</span>
              <span className="font-mono-tabular text-xs text-foreground">{avgScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">avg chars</span>
              <span className="font-mono-tabular text-xs text-foreground">{avgChars}</span>
            </div>
          </div>
        </BlurFade>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <BlurFade key={card.id || `card-${i}`} delay={0.18 + i * 0.04} inView>
              <DailyCard
                solution={card.solution}
                state={card.state}
                date={card.date}
                layout="grid"
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </div>
  );
}
