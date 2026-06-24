import type { Analytics } from "@/types";

const COLORS = [
  "var(--surface-2)",
  "oklch(0.45 0.12 125)",
  "oklch(0.60 0.16 125)",
  "oklch(0.74 0.18 125)",
  "oklch(0.88 0.19 125)",
];

export function Heatmap({ data }: { data: Analytics["heatmap"] }) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground font-mono">no activity yet</div>;
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
      <div className="flex gap-0.75 min-w-fit">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-0.75">
            {w.map((cell, di) =>
              cell ? (
                <div
                  key={di}
                  title={`${cell.date}${cell.level > 0 ? " · solved" : ""}`}
                  className="h-3 w-3 rounded-[3px] transition-transform hover:scale-125"
                  style={{ background: COLORS[cell.level] }}
                />
              ) : (
                <div key={di} className="h-3 w-3" />
              ),
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>less</span>
        {COLORS.map((c, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-[3px]"
            style={{ background: c }}
          />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}
