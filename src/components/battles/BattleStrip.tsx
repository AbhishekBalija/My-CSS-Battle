import { Link } from "react-router-dom";
import { Swords, ArrowRight } from "lucide-react";
import BattleCard from "./BattleCard";
import { getBattleSolutions } from "@/lib/data";
import VoiceLine from "../VoiceLine";
import { Highlighter } from "../ui/highlighter";

export default function BattleStrip() {
  const battles = getBattleSolutions();
  const latest = battles.slice(-8);

  return (
    <section>
      {/* Header — flat, editorial. Cards stand on the canvas, not in a box. */}
      <div className="flex items-start justify-between gap-4 pb-3 sm:pb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <Swords className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Battles
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              <VoiceLine as="span">
                Sometimes I solve them. sometimes I stare at them and{" "}
                <Highlighter
                  action="highlight"
                  color="var(--highlight-marker)"
                  animationDuration={800}
                  isView
                >
                  close the tab.
                </Highlighter>
              </VoiceLine>
            </p>
          </div>
        </div>
        <Link
          to="/battles"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-xs font-medium text-foreground rounded-full transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Grid of 8 — matches the daily card footprint at ~4-up. */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {latest.map((sol) => (
          <BattleCard key={sol.id} solution={sol} />
        ))}
      </div>
    </section>
  );
}
