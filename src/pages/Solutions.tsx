import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, AlertTriangle, Check } from "lucide-react";
import { useState } from "react";
import SEO from "@/components/SEO";
import VoiceLine from "@/components/VoiceLine";
import { BlurFade } from "@/components/ui/blur-fade";
import { Highlighter } from "@/components/ui/highlighter";
import { ShineBorder } from "@/components/ui/shine-border";
import { GlareHover } from "@/components/ui/glare-hover";
import TargetImage from "@/components/ui/TargetImage";
import { getSolutionById } from "@/lib/data";
import { detectTechniques } from "@/lib/detect";
import { formatDateLabel } from "@/lib/dates";

export default function Solution() {
  const { id } = useParams<{ id: string }>();
  const solution = id ? getSolutionById(id) : undefined;
  const [copied, setCopied] = useState(false);

  if (!solution) {
    return (
      <>
        <SEO title="Solution Not Found" path={`/solutions/${id}`} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex flex-col items-center gap-4 text-center py-20">
            <h1 className="font-mono-tabular text-2xl text-foreground">
              solution not found
            </h1>
            <VoiceLine className="text-sm">
              either it doesn't exist or i haven't solved it yet.
            </VoiceLine>
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-xs font-mono text-foreground rounded-full transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> back home
            </Link>
          </div>
        </div>
      </>
    );
  }

  const techniques = detectTechniques(solution.code);
  const isDaily = solution.type === "daily";
  const isPerfectMatch = solution.match === 100;
  const heading = isDaily
    ? `Daily — ${solution.date}`
    : `Battle #${solution.battleNumber} — ${solution.name}`;

  const copyCode = () => {
    navigator.clipboard.writeText(solution.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const solTitle = isDaily
    ? `Daily Target — ${solution.date}`
    : `Battle #${solution.battleNumber} — ${solution.name} CSS Solution`;
  const solDesc = `${isDaily ? "Daily target" : `Battle #${solution.battleNumber} — ${solution.name}`} CSS solution. Score: ${solution.score?.toFixed(2)}, ${solution.characters} chars, ${solution.match?.toFixed(2)}% match. Golfed CSS code included.`;

  return (
    <>
      <SEO
        title={solTitle}
        description={solDesc}
        path={`/solutions/${id}`}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-6">
        {/* Back link */}
        <BlurFade delay={0.05} inView>
          <Link
            to={isDaily ? "/daily" : "/battles"}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            back to {isDaily ? "daily targets" : "battles"}
          </Link>
        </BlurFade>

        {/* Heading */}
        <BlurFade delay={0.1} inView>
          <div className="flex flex-wrap items-baseline justify-between gap-y-2 font-mono-tabular">
            <h1 className="text-2xl sm:text-3xl tracking-tight text-foreground">
              {heading}
            </h1>
            <div className="flex items-baseline gap-4">
              <span className="text-xl sm:text-2xl text-primary font-medium">
                {solution.score?.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {`{${solution.characters}}`}
              </span>
              <span className="text-sm text-muted-foreground">·</span>
              {isPerfectMatch ? (
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <Highlighter
                    action="highlight"
                    color="var(--highlight-marker)"
                    animationDuration={800}
                    isView
                  >
                    100% match
                  </Highlighter>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  match {solution.match?.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Target + Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Target image + tags */}
          <BlurFade delay={0.15} inView>
            <div className="flex flex-col gap-4">
              <div className="hairline rounded-xl overflow-hidden bg-surface/50">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="font-mono-tabular text-[10px] uppercase tracking-widest text-muted-foreground">
                    target
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatDateLabel(solution.date)}
                  </span>
                </div>
                <div className="aspect-4/3 checker-bg">
                  <TargetImage
                    src={solution.targetImage}
                    colors={solution.colors}
                    alt={solution.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Technique tags with GlareHover */}
              <div className="flex flex-col gap-2">
                <span className="font-mono-tabular text-[10px] uppercase tracking-widest text-muted-foreground">
                  approach
                </span>
                <div className="flex flex-wrap gap-2">
                  {techniques.map((t, i) => (
                    <GlareHover
                      key={i}
                      className="rounded-full cursor-default!"
                      background="transparent"
                      color="var(--glare-color)"
                      opacity={0.1}
                      duration={500}
                      playOnce
                    >
                      <span className="relative z-20 block px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 font-mono text-[10px] text-primary tracking-wide">
                        {t.label}
                      </span>
                    </GlareHover>
                  ))}
                </div>
              </div>

              {/* External link */}
              <a
                href={solution.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors w-fit"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                view on cssbattle.dev
              </a>
            </div>
          </BlurFade>

          {/* Right: Code editor */}
          <BlurFade delay={0.2} inView>
            <div className="flex flex-col gap-3">
              {/* Warning banner with Highlighter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-warn/30 bg-warn/10">
                <AlertTriangle className="w-3.5 h-3.5 text-warn shrink-0" />
                <span className="font-mono text-[10px] sm:text-[11px] text-warn tracking-wide">
                  golf code —{" "}
                  <Highlighter
                    action="underline"
                    color="var(--warn)"
                    animationDuration={600}
                    isView
                  >
                    would get you fired
                  </Highlighter>{" "}
                  in a real codebase
                </span>
                <span className="ml-auto font-mono-tabular text-[10px] text-muted-foreground shrink-0">
                  {`{${solution.characters}} chars`}
                </span>
              </div>

              {/* Code block with ShineBorder */}
              <div className="relative rounded-xl overflow-hidden bg-card">
                <ShineBorder
                  shineColor="var(--shine-color)"
                  borderWidth={1}
                  duration={14}
                  className="rounded-xl z-30"
                />
                {/* Editor title bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warn/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                      solution.css
                    </span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-0.5 rounded border border-border hover:border-primary/30"
                  >
                    {copied ? "copied!" : "copy"}
                  </button>
                </div>

                {/* Code content */}
                <div className="p-4 overflow-x-auto">
                  <pre className="font-mono text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-all">
                    <code>{solution.code}</code>
                  </pre>
                </div>
              </div>
            </div>
            </BlurFade>
        </div>
      </div>
    </div>
    </>
  );
}
