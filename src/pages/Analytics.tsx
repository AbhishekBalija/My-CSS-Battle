import {
  TrendingUp,
  Calendar,
  Target,
  Award,
  Hash,
  Swords,
  Flame,
  Type,
  Gauge,
} from "lucide-react";
import {
  Area,
  AreaChart as ReAreaChart,
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
} from "recharts";

import SEO from "@/components/SEO";
import VoiceLine from "@/components/VoiceLine";
import { BlurFade } from "@/components/ui/blur-fade";
import { Heatmap } from "@/components/ui/Heatmap";
import { ShineBorder } from "@/components/ui/shine-border";
import { GlareHover } from "@/components/ui/glare-hover";
import { Highlighter } from "@/components/ui/highlighter";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
    <div className="group relative rounded-xl transition-all duration-300 hover:-translate-y-0.5 h-full">
      <div className="relative rounded-xl overflow-hidden border border-border bg-surface/50 transition-colors duration-300 group-hover:border-transparent h-full">
        <ShineBorder
          shineColor="var(--shine-color)"
          borderWidth={1}
          duration={20}
          className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        />
        <GlareHover
          className="rounded-xl cursor-default! h-full"
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
              <span className="font-mono-tabular text-[10px] uppercase tracking-widest">
                {label}
              </span>
            </div>
            <div className="mt-2 font-mono-tabular text-2xl text-foreground">
              {value}
            </div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
        </GlareHover>
      </div>
    </div>
  );
}

const scoreConfig = {
  score: { label: "Score", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const charConfig = {
  chars: { label: "Characters", color: "var(--chart-area-1)" },
} satisfies ChartConfig;

const approachConfig: ChartConfig = {};

const radialConfig = {
  match: { label: "Avg Match", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export default function Analytics() {
  const a = getAnalytics();

  const scoreData = a.scoreSeries.map((s) => ({
    date: formatDateLabel(s.date),
    score: s.score,
    name: s.name,
  }));

  const charData = a.charSeries.map((c) => ({
    date: formatDateLabel(c.date),
    chars: c.charCount,
    name: c.name,
  }));

  const radialData = [{ name: "match", value: a.avgMatch, fill: "var(--color-chart-1)" }];

  const approachData = a.approachBreakdown.map((a) => ({
    name: a.name,
    count: a.count,
    fill: a.fill,
  }));
  return (
    <>
      <SEO
        title="Analytics"
        description="Personal CSS Battle analytics — streaks, scores, character counts, heatmap, and monthly recaps. Track your code golf progress over time."
        path="/analytics"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <BlurFade delay={0.05} inView>
          <header>
            <h1 className="font-mono-tabular text-3xl tracking-tight text-foreground">
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
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <Stat
              label="current streak"
              value={`${a.currentStreak}d`}
              icon={<Flame className="w-3.5 h-3.5 text-primary" />}
            />
            <Stat
              label="longest streak"
              value={`${a.longestStreak}d`}
              icon={<Award className="w-3.5 h-3.5" />}
            />
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
              icon={<TrendingUp className="w-3.5 h-3.5" />}
            />
            <Stat
              label="avg chars"
              value={Math.round(a.avgCharCount)}
              icon={<Hash className="w-3.5 h-3.5" />}
            />
            <Stat
              label="avg match"
              value={`${a.avgMatch.toFixed(2)}%`}
              icon={<Target className="w-3.5 h-3.5" />}
            />
            <Stat
              label="total chars"
              value={a.totalCharsWritten.toLocaleString()}
              hint="across all solves"
              icon={<Type className="w-3.5 h-3.5" />}
            />
          </section>
        </BlurFade>

        {/* Profile stats + Radial match gauge */}
        <BlurFade delay={0.15} inView>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="rating"
              value={a.profile.rating}
              icon={<Gauge className="w-3.5 h-3.5 text-primary" />}
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
              label="dailies played"
              value={a.profile.dailyTargetsPlayed}
              icon={<Calendar className="w-3.5 h-3.5" />}
            />
          </section>
        </BlurFade>

        {/* Heatmap */}
        <BlurFade delay={0.2} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              activity — past year
            </h2>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <Heatmap data={a.heatmap} />
            </div>
          </section>
        </BlurFade>

        {/* Score bar chart + Radial match gauge side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BlurFade delay={0.25} inView className="lg:col-span-2">
            <section className="flex flex-col gap-3 h-full">
              <h2 className="font-mono-tabular text-xl text-foreground">
                score per daily
              </h2>
              <VoiceLine className="text-sm">
                <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                  higher is better
                </Highlighter>. each bar is one day.
              </VoiceLine>
              <div className="hairline rounded-xl bg-surface/50 p-4 flex-1">
                <ChartContainer config={scoreConfig} className="h-55 w-full aspect-auto">
                  <ReBarChart accessibilityLayer data={scoreData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      interval="preserveStartEnd"
                      tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                      domain={["dataMin - 20", "dataMax + 20"]}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent labelKey="name" />}
                    />
                    <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]}>
                      {scoreData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill="var(--color-chart-1)" />
                      ))}
                    </Bar>
                  </ReBarChart>
                </ChartContainer>
              </div>
            </section>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <section className="flex flex-col gap-3 h-full">
              <h2 className="font-mono-tabular text-xl text-foreground">
                avg match
              </h2>
              <div className="hairline rounded-xl bg-surface/50 p-4 flex items-center justify-center flex-1">
                <ChartContainer config={radialConfig} className="h-55 w-full aspect-auto">
                  <RadialBarChart
                    accessibilityLayer
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="60%"
                    outerRadius="90%"
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" background cornerRadius={8} fill="var(--color-match)" />
                    <ChartTooltip
                      content={<ChartTooltipContent hideIndicator />}
                    />
                  </RadialBarChart>
                </ChartContainer>
                <div className="absolute font-mono-tabular text-2xl text-foreground">
                  {a.avgMatch.toFixed(2)}%
                </div>
              </div>
            </section>
          </BlurFade>
        </div>

        {/* Character count area chart */}
        <BlurFade delay={0.35} inView>
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
              <ChartContainer config={charConfig} className="h-55 w-full aspect-auto">
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

        {/* Approach breakdown */}
        <BlurFade delay={0.4} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              approach breakdown
            </h2>
            <VoiceLine className="text-sm">
              <Highlighter action="underline" color="var(--highlight-underline)" animationDuration={800} isView>
                gradients are my signature
              </Highlighter>. the chart doesn't lie.
            </VoiceLine>
            <div className="hairline rounded-xl bg-surface/50 p-4">
              <ChartContainer config={approachConfig} className="h-65 w-full aspect-auto">
                <ReBarChart
                  accessibilityLayer
                  data={approachData}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={110}
                    tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {approachData.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ChartContainer>
            </div>
          </section>
        </BlurFade>

        {/* Highlights */}
        <BlurFade delay={0.45} inView>
          <section className="flex flex-col gap-3">
            <h2 className="font-mono-tabular text-xl text-foreground">
              highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {a.bestScore && (
                <div className="hairline rounded-xl bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Award className="w-4 h-4" />
                    <span className="font-mono-tabular text-[10px] uppercase tracking-widest">
                      highest score
                    </span>
                  </div>
                  <div className="mt-2 font-mono-tabular text-2xl text-foreground">
                    {a.bestScore.score?.toFixed(2)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {a.bestScore.name} · {`{${a.bestScore.characters}}`}
                  </div>
                </div>
              )}
              {a.fewestChars && (
                <div className="hairline rounded-xl bg-surface/50 p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Hash className="w-4 h-4" />
                    <span className="font-mono-tabular text-[10px] uppercase tracking-widest">
                      fewest characters
                    </span>
                  </div>
                  <div className="mt-2 font-mono-tabular text-2xl text-foreground">
                    {`{${a.fewestChars.characters}}`}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {a.fewestChars.name} · {a.fewestChars.score?.toFixed(2)} pts
                  </div>
                </div>
              )}
            </div>
          </section>
        </BlurFade>

        {/* Monthly recap */}
        <BlurFade delay={0.5} inView>
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
                          {m.best ? `{${m.best.charCount}}` : "—"}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {m.worst ? `{${m.worst.charCount}}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </BlurFade>
      </div>
    </div>
    </>
  );
}
