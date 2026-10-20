import { normalizeInsight } from "@/lib/approach-contract";

// The author's short note on why an approach works. Most records have none,
// and then nothing renders so older solutions look exactly as before.
export default function ApproachInsight({ insight }: { insight?: string }) {
  const text = normalizeInsight(insight);
  if (!text) return null;

  return (
    <p className="px-3 font-mono text-[11px] sm:text-xs leading-relaxed text-muted-foreground">
      <span className="text-primary/80">{"/* insight */"}</span> {text}
    </p>
  );
}
