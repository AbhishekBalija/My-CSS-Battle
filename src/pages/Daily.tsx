import { Calendar } from "lucide-react";
import PageShell from "@/components/PageShell";
import DailyCard from "@/components/daily/DailyCard";
import SolutionStats from "@/components/solutions/SolutionStats";
import { BlurFade } from "@/components/ui/blur-fade";
import { getDailyTimeline } from "@/lib/data";
import { formatDateFull } from "@/lib/dates";

export default function Daily() {
  const timeline = getDailyTimeline();
  const { today, yesterday, past, all } = timeline;

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
    <PageShell
      title="Daily Targets"
      description="Daily CSS Battle targets — one puzzle every day. Browse past daily challenges and track your solving progress with scores and character counts."
      path="/daily"
      heading="Daily Targets"
      voiceLine="one a day, every day. no leaderboards, just the puzzle."
    >
      <BlurFade delay={0.12} inView>
        <SolutionStats
          solutions={all}
          extra={
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">today</span>
              <span className="font-mono-tabular text-xs text-foreground">
                {todayDate || "—"}
              </span>
            </div>
          }
        />
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
    </PageShell>
  );
}
