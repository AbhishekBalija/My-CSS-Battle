import { useState } from "react";
import { useParams } from "react-router-dom";
import { Swords, Search } from "lucide-react";
import PageShell from "@/components/PageShell";
import BattleCard from "@/components/battles/BattleCard";
import SolutionStats from "@/components/solutions/SolutionStats";
import Pagination from "@/components/Pagination";
import { BlurFade } from "@/components/ui/blur-fade";
import { getBattleSolutions } from "@/lib/data";
import {
  BATTLES_PER_PAGE,
  getTotalPages,
  getPageSlice,
  clampPage,
} from "@/lib/pagination";
import type { Solution } from "../types";

type BattlesSort = keyof typeof sortFns;

const sortFns = {
  "battle-asc": (a: Solution, b: Solution) =>
    (a.battleNumber ?? 0) - (b.battleNumber ?? 0),
  "battle-desc": (a: Solution, b: Solution) =>
    (b.battleNumber ?? 0) - (a.battleNumber ?? 0),
  "score-desc": (a: Solution, b: Solution) => (b.score ?? 0) - (a.score ?? 0),
  "char-asc": (a: Solution, b: Solution) =>
    (a.characters ?? 0) - (b.characters ?? 0),
  "date-desc": (a: Solution, b: Solution) =>
    new Date(b.date).getTime() - new Date(a.date).getTime(),
};

export default function Battles() {
  const { page } = useParams<{ page?: string }>();
  const [sort, setSort] = useState<BattlesSort>("battle-desc");
  const [query, setQuery] = useState("");

  const allBattles = getBattleSolutions();
  const totalPages = getTotalPages(allBattles.length, BATTLES_PER_PAGE);
  const currentPage = clampPage(
    page ? parseInt(page, 10) : 1,
    totalPages,
  );

  const filtered = allBattles.filter((s) => {
    if (!query.trim()) return true;
    const q = query.trim().replace(/^#/, "");
    const num = s.battleNumber ?? 0;
    return (
      String(num).includes(q) || s.name.toLowerCase().includes(q.toLowerCase())
    );
  });

  const sorted: Solution[] = [...filtered].sort(sortFns[sort]);
  const paged = getPageSlice(sorted, currentPage, BATTLES_PER_PAGE);

  const latestNum = Math.max(
    ...allBattles.map((s) => s.battleNumber ?? 0),
    0,
  );

  const pageTitle = currentPage > 1 ? `All Battles · Page ${currentPage}` : "All Battles";
  const canonicalPath = currentPage > 1 ? `/battles/page/${currentPage}` : "/battles";
  const prevPath =
    currentPage > 1
      ? currentPage === 2
        ? "/battles"
        : `/battles/page/${currentPage - 1}`
      : undefined;
  const nextPath =
    currentPage < totalPages ? `/battles/page/${currentPage + 1}` : undefined;

  return (
    <PageShell
      title={pageTitle}
      description="Browse all CSS Battle solutions sorted by battle number, score, or character count. View golfed CSS code for every solved target."
      path={canonicalPath}
      heading="All Battles"
      voiceLine="sometimes i solve them. sometimes i stare at them and close the tab."
      prev={prevPath}
      next={nextPath}
    >
      <BlurFade delay={0.12} inView>
        <SolutionStats
          solutions={allBattles}
          extra={
            <div className="flex items-center gap-2">
              <Swords className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                latest
              </span>
              <span className="font-mono-tabular text-xs text-foreground">
                #{latestNum}
              </span>
            </div>
          }
        />
      </BlurFade>

      <BlurFade delay={0.18} inView>
        <div className="hairline flex flex-wrap items-center gap-4 rounded-lg bg-surface/40 p-3 text-sm">
          <div className="flex items-center gap-2 flex-1 min-w-45">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search #123 or name..."
              className="flex-1 bg-transparent font-mono-tabular text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              sort
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as BattlesSort)}
              className="rounded-md border border-border bg-surface px-2 py-1 font-mono-tabular text-xs text-foreground focus:outline-none focus:border-primary/50"
            >
              <option value="battle-desc">newest battle</option>
              <option value="battle-asc">oldest battle</option>
              <option value="score-desc">highest score</option>
              <option value="char-asc">fewest chars</option>
              <option value="date-desc">date</option>
            </select>
          </label>
        </div>
      </BlurFade>

      {paged.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paged.map((sol, i) => (
              <BlurFade key={sol.id} delay={0.24 + i * 0.04} inView>
                <BattleCard solution={sol} />
              </BlurFade>
            ))}
          </div>
          <Pagination
            basePath="/battles"
            currentPage={currentPage}
            totalPages={getTotalPages(sorted.length, BATTLES_PER_PAGE)}
          />
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground font-mono text-sm">
          no battles found for "{query}"
        </div>
      )}
    </PageShell>
  );
}
