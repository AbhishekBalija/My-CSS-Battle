import { useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Scissors,
  TrendingUp,
  Calendar,
  Award,
  Hash,
  Swords,
  Flame,
  Type,
} from "lucide-react";
import {
  Area,
  AreaChart as ReAreaChart,
  LabelList,
  Line,
  LineChart as ReLineChart,
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import SEO from "@/components/SEO";
import VoiceLine from "@/components/VoiceLine";
import { BlurFade } from "@/components/ui/blur-fade";
import { Heatmap } from "@/components/ui/Heatmap";
import { ShineBorder } from "@/components/ui/shine-border";
import { GlareHover } from "@/components/ui/glare-hover";
import { Highlighter } from "@/components/ui/highlighter";
import type { ChartConfig } from "@/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getAnalytics } from "@/lib/analytics";
import { formatDateLabel } from "@/lib/dates";

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-xl transition-all duration-300 hover:-translate-y-0.5 h-full @container">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface/50 transition-colors duration-300 group-hover:border-transparent h-full">
        <ShineBorder
          shineColor="var(--shine-color)"
          borderWidth={1}
          duration={20}
          className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        />
        <GlareHover
          className="rounded-xl cursor-default! place-items-start h-full"
          background="transparent"
          width="100%"
          height="100%"
          color="var(--glare-color)"
          opacity={0.12}
          duration={700}
          playOnce
        >
          <div className="p-4 relative z-20 flex flex-col h-full min-h-22">
            <div className="flex items-center gap-2 text-muted-foreground">
              {icon}
              <span className="font-mono-tabular text-[11px] uppercase tracking-widest truncate">
                {label}
              </span>
            </div>
            <div className="mt-2 font-mono-tabular text-xl sm:text-2xl @sm:text-2xl text-foreground break-words">
              {value}
            </div>
            <div className="mt-1 min-h-4 text-xs text-muted-foreground">
              {hint}
            </div>
          </div>
        </GlareHover>
      </div>
    </div>
  );
}

const scoreConfig = {
  score: { label: "Avg score", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const charConfig = {
  chars: { label: "Characters", color: "var(--chart-area-1)" },
} satisfies ChartConfig;

const rankConfig = {
  rank: { label: "Rank", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const battleConfig = {
  chars: { label: "Characters", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

// Highlight cards link to their solution page
const highlightLinkClass =
  "group hairline rounded-xl bg-surface/50 p-4 block transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

const breakdownConfig: ChartConfig = {};

/** True on phone-width screens; charts use it to give bars more room. */
function useIsNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(max-width: 640px)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(max-width: 640px)").matches,
    () => false, // server render: assume a wide screen
  );
}

/** Techniques ranked: one colour (every bar means the same thing), count at the end. */
function TechniqueChart({ data }: { data: { name: string; count: number }[] }) {
  const narrow = useIsNarrow();
  // Drop any per-row colour: Recharts would use it over the bar's single fill
  const rows = data.map(({ name, count }) => ({ name, count }));
  return (
    // Grow with the number of rows so every label fits
    <ChartContainer
      config={breakdownConfig}
      className="w-full aspect-auto"
      style={{ height: Math.max(160, rows.length * 26) }}
    >
      <ReBarChart
        accessibilityLayer
        data={rows}
        layout="vertical"
        margin={{ left: narrow ? 0 : 8, right: 36 }}
        barCategoryGap={6}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          width={narrow ? 150 : 180}
          tick={{ fontSize: narrow ? 10 : 11, fontFamily: "var(--font-mono)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]}>
          <LabelList
            dataKey="count"
            position="right"
            className="fill-muted-foreground"
            style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
        </Bar>
      </ReBarChart>
    </ChartContainer>
  );
}

/**
 * Approaches are parts of one whole (every solve has exactly one), so they
 * read best as a single split bar with a legend, not separate bars.
 */
function ApproachSplit({ data }: { data: { name: string; count: number; fill: string }[] }) {
  const total = data.reduce((sum, row) => sum + row.count, 0);
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-10 w-full overflow-hidden rounded-lg">
        {data.map((row) => {
          const pct = (row.count / total) * 100;
          return (
            <div
              key={row.name}
              title={`${row.name}: ${row.count} (${pct.toFixed(0)}%)`}
              className="flex items-center overflow-hidden px-3 font-mono-tabular text-xs text-background"
              style={{ width: `${pct}%`, background: row.fill }}
            >
              {/* Label only where the segment is wide enough to fit it */}
              {pct >= 14 && <span className="truncate">{row.name}</span>}
            </div>
          );
        })}
      </div>
      <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((row) => (
          <li key={row.name} className="flex items-baseline gap-2 font-mono-tabular text-xs">
            <span className="size-2.5 shrink-0 translate-y-px rounded-[3px]" style={{ background: row.fill }} />
            <span className="text-muted-foreground">{row.name}</span>
            <span className="ml-auto text-foreground">{row.count}</span>
            <span className="w-9 text-right text-muted-foreground">
              {((row.count / total) * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}


export default function Analytics() {
  const a = getAnalytics();

  const scoreData = a.weeklyScores.map((w) => ({
    date: formatDateLabel(w.weekStart),
    score: Number(w.avgScore.toFixed(1)),
    name: `week of ${formatDateLabel(w.weekStart)} · ${w.solved} solved`,
  }));

  const charData = a.charSeries.map((c) => ({
    date: formatDateLabel(c.date),
    chars: c.charCount,
    name: c.name,
  }));


  const rankData = a.rankSeries.map((r) => ({
    date: formatDateLabel(r.date),
    rank: r.rank,
  }));
  const firstRank = a.rankSeries[0]?.rank;
  const lastRank = a.rankSeries.at(-1)?.rank;

  const battleData = a.battles.series.map((b) => ({
    battle: `#${b.battleNumber}`,
    chars: b.chars,
    name: b.name,
  }));

  return (
    <>
      <SEO
        title="CSSBattle Solution Analytics"
        description="Explore CSSBattle solution analytics including daily streaks, battle scores, character counts, match percentages, heatmaps, and progress over time."
        path="/analytics"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <BlurFade delay={0.05} inView>
          <header>
            <h1 className="font-mono-tabular text-fluid-3xl tracking-tight text-foreground">
              Analytics
            </h1>
            <VoiceLine className="mt-2 text-sm">
              not here to climb rankings. these are just the{" "}
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                numbers from showing up
              </Highlighter>{" "}
              every day.
            </VoiceLine>
          </header>
        </BlurFade>

        {/* Stats grid */}
        <BlurFade delay={0.1} inView>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="dailies solved"
              value={`${a.totalDailySolved}/${a.totalDailyAvailable}`}
              icon={<Calendar className="w-3.5 h-3.5" />}
            />
            <Stat
              label="battles solved"
              value={`${a.battles.solved}/${a.battles.total}`}
              icon={<Swords className="w-3.5 h-3.5 text-primary" />}
            />
            <Stat
              label="avg score"
              value={a.avgScore.toFixed(1)}
              hint={`${a.avgMatch.toFixed(2)}% avg match`}
              icon={<TrendingUp className="w-3.5 h-3.5" />}
            />
            <Stat
              label="avg chars"
              value={Math.round(a.avgCharCount)}
              icon={<Hash className="w-3.5 h-3.5" />}
            />
            <Stat
              label="total chars"
              value={a.totalCharsWritten.toLocaleString()}
              hint="across all solves"
              icon={<Type className="w-3.5 h-3.5" />}
            />
            <Stat
              label="global rank"
              value={`#${a.profile.rank}`}
              hint={`of ${a.profile.totalPlayers.toLocaleString()}`}
              icon={<Award className="w-3.5 h-3.5" />}
            />
            <Stat
              label="total score"
              value={a.profile.totalScore.toLocaleString()}
              icon={<TrendingUp className="w-3.5 h-3.5" />}
            />
            <Stat
              label="targets played"
              value={a.profile.dailyTargetsPlayed}
              hint="on cssbattle.dev"
              icon={<Calendar className="w-3.5 h-3.5" />}
            />
          </section>
        </BlurFade>

        {/* Global rank over time, from the daily profile snapshots */}
        {rankData.length > 1 && (
          <BlurFade delay={0.15} inView>
            <section className="flex flex-col gap-3">
              <h2 className="font-mono-tabular text-xl text-foreground">
                rank over time
              </h2>
              <VoiceLine className="text-sm">
                #{firstRank} to{" "}
                <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                  #{lastRank}
                </Highlighter>{" "}
                since tracking started. up is better.
              </VoiceLine>
              <div className="hairline rounded-xl bg-surface/50 p-4">
                <ChartContainer config={rankConfig} className="h-52 sm:h-55 w-full aspect-auto">
                  <ReLineChart accessibilityLayer data={rankData} margin={{ right: 16 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      minTickGap={24}
                      tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                    />
                    {/* Reversed so a better (smaller) rank sits higher */}
                    <YAxis
                      reversed
                      tickLine={false}
                      axisLine={false}
                      width={48}
                      tickFormatter={(v: number) => `#${v}`}
                      tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="stepAfter"
                      dataKey="rank"
                      stroke="var(--color-chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </ReLineChart>
                </ChartContainer>
              </div>
            </section>
          </BlurFade>
        )}

        {/* Weekly score bar chart */}
        <BlurFade delay={0.2} inView>
          <section className="flex flex-col gap-3 h-full">
            <h2 className="font-mono-tabular text-xl text-foreground">
              score per week
            </h2>
            <VoiceLine className="text-sm">
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                higher is better
              </Highlighter>. each bar is one week's average.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4 flex-1">
              <ChartContainer config={scoreConfig} className="h-52 sm:h-55 w-full aspect-auto">
                <ReBarChart accessibilityLayer data={scoreData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                  minTickGap={24}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                    // Round the axis to tens so ticks read 630, 660... not 627.4
                    domain={[
                      (min: number) => Math.floor((min - 20) / 10) * 10,
                      (max: number) => Math.ceil((max + 20) / 10) * 10,
                    ]}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="name" />}
                  />
                  <Bar dataKey="score" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ChartContainer>
            </div>
          </section>
        </BlurFade>

        {/* Character count area chart */}
        <BlurFade delay={0.3} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              character count over time
            </h2>
            <VoiceLine className="text-sm">
              the line wants to{" "}
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                go down
              </Highlighter>. that's the whole game.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <ChartContainer config={charConfig} className="h-52 sm:h-55 w-full aspect-auto">
                <ReAreaChart accessibilityLayer data={charData}>
                  <defs>
                    <linearGradient id="fillChars" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-area-1)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="var(--chart-area-1)" stopOpacity="0.08" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    minTickGap={24}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="name" />}
                  />
                  <Area
                    type="monotone"
                    dataKey="chars"
                    stroke="var(--chart-area-1)"
                    strokeWidth={2}
                    fill="url(#fillChars)"
                  />
                </ReAreaChart>
              </ChartContainer>
            </div>
          </section>
        </BlurFade>

        {/* Battles */}
        <BlurFade delay={0.33} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              battles
            </h2>
            <VoiceLine className="text-sm">
              the classic targets. each bar is one battle,{" "}
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                shorter is better
              </Highlighter>.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <div className="mb-4 flex flex-wrap gap-x-8 gap-y-2 font-mono-tabular text-sm">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">solved </span>
                  <span className="text-foreground">{a.battles.solved}/{a.battles.total}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">avg score </span>
                  <span className="text-foreground">{a.battles.avgScore.toFixed(1)}</span>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground">avg chars </span>
                  <span className="text-foreground">{Math.round(a.battles.avgChars)}</span>
                </div>
              </div>
              <ChartContainer config={battleConfig} className="h-52 sm:h-55 w-full aspect-auto">
                <ReBarChart accessibilityLayer data={battleData} margin={{ right: 16 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="battle"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                    minTickGap={24}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent labelKey="name" />}
                  />
                  <Bar dataKey="chars" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ChartContainer>
            </div>
          </section>
        </BlurFade>

        {/* Approach: one strategy per solve, shown as parts of the whole */}
        <BlurFade delay={0.35} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              approach
            </h2>
            <VoiceLine className="text-sm">
              how each solve is built. one per target.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <ApproachSplit data={a.approachBreakdown} />
            </div>
          </section>
        </BlurFade>

        {/* Techniques: CSS features used, ranked */}
        <BlurFade delay={0.38} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              techniques used
            </h2>
            <VoiceLine className="text-sm">
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                gradients are my signature
              </Highlighter>. the chart doesn't lie.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <TechniqueChart data={a.techniqueBreakdown} />
            </div>
          </section>
        </BlurFade>

        {/* Highlights */}
        <BlurFade delay={0.4} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.bestScore && (
                <Link to={`/solutions/${a.bestScore.id}`} className={highlightLinkClass}>
                  <div className="flex items-center gap-2 text-primary">
                    <Award className="w-4 h-4" />
                    <span className="font-mono-tabular text-[11px] uppercase tracking-widest">
                      best solve
                    </span>
                    <ArrowUpRight className="ml-auto w-3.5 h-3.5 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                  </div>
                  <div className="mt-2 font-mono-tabular text-2xl text-foreground">
                    {a.bestScore.score?.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {a.bestScore.name} · {`{${a.bestScore.characters}}`}
                  </div>
                </Link>
              )}
              {a.biggestCut && (
                <Link to={`/solutions/${a.biggestCut.solution.id}`} className={highlightLinkClass}>
                  <div className="flex items-center gap-2 text-primary">
                    <Scissors className="w-4 h-4" />
                    <span className="font-mono-tabular text-[11px] uppercase tracking-widest">
                      biggest cut
                    </span>
                    <ArrowUpRight className="ml-auto w-3.5 h-3.5 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                  </div>
                  <div className="mt-2 font-mono-tabular text-2xl text-foreground">
                    -{a.biggestCut.from - a.biggestCut.to} chars
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {a.biggestCut.solution.name} · {`{${a.biggestCut.from}}`} → {`{${a.biggestCut.to}}`}
                  </div>
                </Link>
              )}
            </div>
          </section>
        </BlurFade>

        {/* Monthly recap */}
        <BlurFade delay={0.45} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              monthly recap
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-140 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="py-2 pr-4">month</th>
                    <th className="py-2 pr-4">solved</th>
                    <th className="py-2 pr-4">avg score</th>
                    <th className="py-2 pr-4">avg chars</th>
                    <th className="py-2 pr-4">best</th>
                    <th className="py-2">worst</th>
                  </tr>
                </thead>
                <tbody className="font-mono-tabular">
                  {a.monthly.map((m) => {
                    const [y, mo] = m.monthKey.split("-");
                    const monthName = new Date(parseInt(y), parseInt(mo) - 1).toLocaleString("en", { month: "short" });
                    return (
                      <tr key={m.monthKey} className="border-b border-border/50 transition-colors hover:bg-muted/20">
                        <td className="py-2 pr-4 text-foreground">{monthName} {y}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{m.solved}</td>
                        <td className="py-2 pr-4 text-foreground">{m.avgScore.toFixed(1)}</td>
                        <td className="py-2 pr-4 text-muted-foreground">{Math.round(m.avgChars)}</td>
                        <td className="py-2 pr-4 text-primary">
                          {m.best ? (
                            <Link to={`/solutions/${m.best.id}`} className="underline-offset-4 hover:underline">
                              {`{${m.best.charCount}}`}
                            </Link>
                          ) : "-"}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {m.worst ? (
                            <Link to={`/solutions/${m.worst.id}`} className="underline-offset-4 hover:underline hover:text-foreground">
                              {`{${m.worst.charCount}}`}
                            </Link>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </BlurFade>

        {/* Heatmap + streak companion — the closing statement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BlurFade delay={0.5} inView className="lg:col-span-2">
            <section className="flex flex-col gap-3 h-full">
              <h2 className="font-mono-tabular text-xl text-foreground">
                activity · past year
              </h2>
              <div className="hairline rounded-xl bg-surface/50 p-4 flex-1">
                <Heatmap data={a.heatmap} />
              </div>
            </section>
          </BlurFade>

          <BlurFade delay={0.55} inView>
            <section className="flex flex-col gap-3 h-full">
              <h2 className="font-mono-tabular text-xl text-foreground">
                streak
              </h2>
              <div className="hairline rounded-xl bg-surface/50 p-4 flex flex-col justify-center gap-4 flex-1">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Flame className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono-tabular text-[11px] uppercase tracking-widest">
                      current
                    </span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-2xl text-foreground">
                    {a.currentStreak}d
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-3.5 h-3.5" />
                    <span className="font-mono-tabular text-[11px] uppercase tracking-widest">
                      longest
                    </span>
                  </div>
                  <div className="mt-1 font-mono-tabular text-2xl text-foreground">
                    {a.longestStreak}d
                  </div>
                </div>
              </div>
            </section>
          </BlurFade>
        </div>
      </div>
    </div>
    </>
  );
}
