import { Link } from "react-router-dom";
import { Swords, ArrowRight } from "lucide-react";
import BattleCard from "./BattleCard";
import { getBattleSolutions } from "@/lib/data";
import VoiceLine from "../VoiceLine";
import { Highlighter } from "../ui/highlighter";

export default function BattleStrip() {
  const battles = getBattleSolutions();
  const latest = battles.slice(-6);

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Swords className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              Battles
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              <VoiceLine>
                Sometimes I solve them. sometimes I stare at them and{" "}
                <Highlighter
                  action="highlight"
                  color="oklch(0.88 0.19 125 / 0.25)"
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

      {/* Grid of 6 */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {latest.map((sol) => (
            <BattleCard key={sol.id} solution={sol} />
          ))}
        </div>
      </div>
    </section>
  );
}
