import type { Analytics } from "@/types";

const COLORS = [
  "var(--heatmap-0)",
  "var(--heatmap-1)",
  "var(--heatmap-2)",
  "var(--heatmap-3)",
  "var(--heatmap-4)",
];

export function Heatmap({ data }: { data: Analytics["heatmap"] }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground font-mono">
        no activity yet. the grid is as empty as the streak.
      </div>
    );
  }

  const firstDate = new Date(data[0].date + "T00:00:00Z");
  const startDow = firstDate.getUTCDay();
  const weeks: ((typeof data)[number] | null)[][] = [];
  let week: ((typeof data)[number] | null)[] = Array(startDow).fill(null);
  for (const d of data) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return (
    <div className="overflow-x-auto">
      {/* Density first: cells are a fixed 12px so the grid stays small and
          dense regardless of how many week-columns exist (9 for short history,
          53 for a full year). Square cells + tight gap avoid the seam rounded
          corners create between adjacent cells. */}
      <div className="flex shrink-0 gap-1 w-fit">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {w.map((cell, di) =>
              cell ? (
                <div
                  key={di}
                  title={`${cell.date}${cell.level > 0 ? " · solved" : ""}`}
                  className="size-3 rounded-[2px] transition-transform hover:scale-125"
                  style={{ background: COLORS[cell.level] }}
                />
              ) : (
                <div key={di} className="size-3" />
              ),
            )}
          </div>
        ))}
      </div>

      {/* Legend + caption below the grid. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>less</span>
          {COLORS.map((c, i) => (
            <span
              key={i}
              className="size-3 rounded-[2px]"
              style={{ background: c }}
            />
          ))}
          <span>more</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground/80">
          {weeks.length} of 53 weeks tracked
        </span>
      </div>
    </div>
  );
}
