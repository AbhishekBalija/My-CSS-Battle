import { useParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import PageShell from "@/components/PageShell";
import DailyCard from "@/components/daily/DailyCard";
import SolutionStats from "@/components/solutions/SolutionStats";
import Pagination from "@/components/Pagination";
import { BlurFade } from "@/components/ui/blur-fade";
import { getDailyTimeline } from "@/lib/data";
import { formatDateFull } from "@/lib/dates";
import {
  DAILY_PER_PAGE,
  getTotalPages,
  getPageSlice,
  clampPage,
} from "@/lib/pagination";

export default function Daily() {
  const { page } = useParams<{ page?: string }>();
  const timeline = getDailyTimeline();
  const { today, yesterday, past, all } = timeline;

  const todayDate = today ? formatDateFull(today.date) : "";
  const cards = [
    {
      id: "today",
      solution: today || undefined,
      state: "today" as const,
      date: today?.date,
    },
    {
      id: "yesterday",
      solution: yesterday || undefined,
      state: "yesterday" as const,
      date: yesterday?.date,
    },
    ...[...past].reverse().map((sol) => ({
      id: sol?.id || `past-${sol?.date}`,
      solution: sol,
      state: "far-past" as const,
      date: sol?.date,
    })),
  ];

  const totalPages = getTotalPages(cards.length, DAILY_PER_PAGE);
  const currentPage = clampPage(page ? parseInt(page, 10) : 1, totalPages);
  const paged = getPageSlice(cards, currentPage, DAILY_PER_PAGE);

  const pageTitle =
    currentPage > 1 ? `Daily Targets · Page ${currentPage}` : "Daily Targets";
  const canonicalPath =
    currentPage > 1 ? `/daily/page/${currentPage}` : "/daily";
  const prevPath =
    currentPage > 1
      ? currentPage === 2
        ? "/daily"
        : `/daily/page/${currentPage - 1}`
      : undefined;
  const nextPath =
    currentPage < totalPages ? `/daily/page/${currentPage + 1}` : undefined;

  return (
    <PageShell
      title={pageTitle}
      description="Daily CSS Battle targets — one puzzle every day. Browse past daily challenges and track your solving progress with scores and character counts."
      path={canonicalPath}
      heading="Daily Targets"
      voiceLine="one a day, every day. no leaderboards, just the puzzle."
      prev={prevPath}
      next={nextPath}
    >
      <BlurFade delay={0.12} inView>
        <SolutionStats
          solutions={all}
          extra={
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                today
              </span>
              <span className="font-mono-tabular text-xs text-foreground">
                {todayDate || "—"}
              </span>
            </div>
          }
        />
      </BlurFade>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {paged.map((card, i) => (
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

      <Pagination
        basePath="/daily"
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </PageShell>
  );
}
