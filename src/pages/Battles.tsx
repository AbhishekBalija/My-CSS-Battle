import { useState } from "react";
import { Swords, CheckCircle2, TrendingUp, Search } from "lucide-react";
import VoiceLine from "@/components/VoiceLine";
import BattleCard from "@/components/battles/BattleCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { getBattleSolutions } from "@/lib/data";
import type { Solution } from "../types";

type BattlesSort =
  | "battle-desc"
  | "battle-asc"
  | "score-desc"
  | "char-asc"
  | "date-desc";

export default function Battles() {
  const [sort, setSort] = useState<BattlesSort>("battle-desc");
  const [query, setQuery] = useState("");

  const allBattles = getBattleSolutions();

  const filtered = allBattles.filter((s) => {
    if (!query.trim()) return true;
    const q = query.trim().replace(/^#/, "");
    const num = s.battleNumber ?? 0;
    return String(num).includes(q) || s.name.toLowerCase().includes(q.toLowerCase());
  });

  const sorted: Solution[] = [...filtered].sort((a, b) => {
    switch (sort) {
      case "battle-asc":
        return (a.battleNumber ?? 0) - (b.battleNumber ?? 0);
      case "battle-desc":
        return (b.battleNumber ?? 0) - (a.battleNumber ?? 0);
      case "score-desc":
        return (b.score ?? 0) - (a.score ?? 0);
      case "char-asc":
        return (a.characters ?? 0) - (b.characters ?? 0);
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      default:
        return 0;
    }
  });

  const solved = allBattles.filter((s) => s.score && s.score > 0);
  const avgScore =
    solved.length > 0
      ? (solved.reduce((sum, s) => sum + (s.score || 0), 0) / solved.length).toFixed(1)
      : "—";
  const avgChars =
    solved.length > 0
      ? Math.round(solved.reduce((sum, s) => sum + (s.characters || 0), 0) / solved.length)
      : 0;
  const latestNum = Math.max(...allBattles.map((s) => s.battleNumber ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        <BlurFade delay={0.05} inView>
          <header>
            <h1 className="font-mono-tabular text-3xl tracking-tight text-foreground">
              All Battles
            </h1>
            <VoiceLine className="mt-2 text-sm">
              sometimes i solve them. sometimes i stare at them and close the tab.
            </VoiceLine>
          </header>
        </BlurFade>

        <BlurFade delay={0.12} inView>
          <div className="hairline flex flex-wrap items-center gap-4 sm:gap-6 rounded-lg bg-surface/40 p-3 text-sm">
            <div className="flex items-center gap-2">
              <Swords className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">latest</span>
              <span className="font-mono-tabular text-xs text-foreground">#{latestNum}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">solved</span>
              <span className="font-mono-tabular text-xs text-foreground">
                {solved.length}/{allBattles.length}
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
              <span className="text-xs uppercase tracking-widest text-muted-foreground">sort</span>
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

        {sorted.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map((sol, i) => (
              <BlurFade key={sol.id} delay={0.24 + i * 0.04} inView>
                <BattleCard solution={sol} />
              </BlurFade>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground font-mono text-sm">
            no battles found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
