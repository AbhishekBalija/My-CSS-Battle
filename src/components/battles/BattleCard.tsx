import { Link } from "react-router-dom";
import { Swords } from "lucide-react";
import TargetImage from "@/components/ui/TargetImage";
import type { Solution } from "../../types";

interface BattleCardProps {
  solution: Solution;
}

export default function BattleCard({ solution }: BattleCardProps) {
  const isSolved = solution.score && solution.score > 0;

  if (!isSolved) {
    return (
      <div className="opacity-70 hover:opacity-100 rounded-lg overflow-hidden border border-border bg-muted/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_40px_-12px_var(--accent-glow)]">
        <div className="h-8 px-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted/40 rounded-full">
            <Swords className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="font-mono text-[9px] sm:text-[10px] font-medium text-muted-foreground tracking-wider uppercase">
              Battle #{solution.battleNumber}
            </span>
          </span>
        </div>
        <div className="aspect-4/3 bg-muted/5 flex items-center justify-center">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            not solved yet
          </span>
        </div>
        <div className="h-12 px-3 flex items-center">
          <span className="font-mono text-[9px] text-muted-foreground/40">
            {solution.name}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={`/solutions/${solution.id}`}
      className="opacity-80 hover:opacity-100 group block rounded-lg overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_16px_50px_-12px_var(--accent-glow)]"
    >
      <div className="h-8 px-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
          <Swords className="w-2.5 h-2.5 text-primary" />
          <span className="font-mono text-[9px] sm:text-[10px] font-medium text-foreground tracking-wider uppercase">
            Battle #{solution.battleNumber}
          </span>
        </span>
      </div>
      <div className="aspect-4/3 overflow-hidden border-y border-border/40">
        <TargetImage
          src={solution.targetImage}
          colors={solution.colors}
          alt={solution.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
        />
      </div>
      <div className="h-12 px-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-muted-foreground truncate transition-colors duration-300 group-hover:text-foreground/80">
          {solution.name}
        </span>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="font-mono text-xs sm:text-sm font-medium text-foreground tabular-nums">
            {solution.score?.toFixed(2)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{`{${solution.characters}}`}</span>
        </div>
      </div>
    </Link>
  );
}
