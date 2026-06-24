import { CheckCircle2, TrendingUp } from "lucide-react";
import type { Solution } from "@/types";

interface SolutionStatsProps {
  solutions: Solution[];
  extra?: React.ReactNode;
}

export default function SolutionStats({ solutions, extra }: SolutionStatsProps) {
  const solved = solutions.filter((s) => s.score && s.score > 0);
  const avgScore =
    solved.length > 0
      ? (solved.reduce((sum, s) => sum + (s.score || 0), 0) / solved.length).toFixed(1)
      : "—";
  const avgChars =
    solved.length > 0
      ? Math.round(solved.reduce((sum, s) => sum + (s.characters || 0), 0) / solved.length)
      : 0;

  return (
    <div className="hairline flex flex-wrap items-center gap-4 sm:gap-6 rounded-lg bg-surface/40 p-3 text-sm">
      {extra}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">solved</span>
        <span className="font-mono-tabular text-xs text-foreground">
          {solved.length}/{solutions.length}
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
  );
}
