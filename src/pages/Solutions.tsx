import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Calendar,
  Swords,
} from "lucide-react";
import { useMemo, useState } from "react";
import SEO, { BASE_URL } from "@/components/SEO";
import JsonLd from "@/components/JsonLd";
import Breadcrumb from "@/components/Breadcrumb";
import VoiceLine from "@/components/VoiceLine";
import { BlurFade } from "@/components/ui/blur-fade";
import { Highlighter } from "@/components/ui/highlighter";
import { ShineBorder } from "@/components/ui/shine-border";
import { GlareHover } from "@/components/ui/glare-hover";
import TargetImage from "@/components/ui/TargetImage";
import {
  getSolutionById,
  getAdjacentSolutions,
  getDailyTimeline,
  solutions,
} from "@/lib/data";
import {
  getSolutionImageUrl,
  getSolutionOgImageUrl,
  getOgImageDimensions,
} from "@/lib/images";
import { detectTechniques } from "@/lib/detect";
import { formatDateLabel, formatDateFull } from "@/lib/dates";

export default function Solution() {
  const { id } = useParams<{ id: string }>();
  const solution = id ? getSolutionById(id) : undefined;
  const [copied, setCopied] = useState(false);

  const randomId = useMemo(() => {
    const solved = solutions.filter((s) => s.score > 0);
    return solved[Math.floor(Math.random() * solved.length)]?.id;
  }, [id]);

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
    ? `Daily — ${formatDateFull(solution.date)}`
    : `Battle #${solution.battleNumber} — ${solution.name}`;

  const copyCode = () => {
    navigator.clipboard.writeText(solution.code || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const solTitle = isDaily
    ? `Daily Target — ${formatDateFull(solution.date)}`
    : `Battle #${solution.battleNumber} — ${solution.name} CSS Solution`;
  const solDesc = `${isDaily ? "Daily target" : `Battle #${solution.battleNumber} — ${solution.name}`} CSS solution. Score: ${solution.score?.toFixed(2)}, ${solution.characters} chars, ${solution.match?.toFixed(2)}% match. Golfed CSS code included.`;
  const solImage = getSolutionOgImageUrl(solution);
  const ogDims = getOgImageDimensions(solImage);

  const { previous, next } = getAdjacentSolutions(solution);
  const latestDaily = getDailyTimeline().today;

  const archiveName = isDaily ? "Daily Targets" : "All Battles";
  const archivePath = isDaily ? "/daily" : "/battles";

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: archiveName, href: archivePath },
    { name: solTitle },
  ];

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: solTitle,
    description: solDesc,
    url: `${BASE_URL}/solutions/${solution.id}`,
    image: solImage,
    datePublished: solution.timestamp,
    author: {
      "@type": "Person",
      name: "abhi",
      url: BASE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "CSS Battle Solutions",
      url: BASE_URL,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: archiveName,
        item: `${BASE_URL}${archivePath}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: solTitle,
        item: `${BASE_URL}/solutions/${solution.id}`,
      },
    ],
  };

  return (
    <>
      <SEO
        title={solTitle}
        description={solDesc}
        path={`/solutions/${id}`}
        image={solImage}
        imageWidth={ogDims.width}
        imageHeight={ogDims.height}
        imageType={ogDims.type}
      />
      <JsonLd data={[webPageLd, breadcrumbLd]} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-6">
          {/* Back link + Breadcrumb */}
          <BlurFade delay={0.05} inView>
            <div className="flex flex-col gap-2">
              <Link
                to={archivePath}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                back to {isDaily ? "daily targets" : "battles"}
              </Link>
              <Breadcrumb items={breadcrumbItems} />
            </div>
          </BlurFade>

          {/* Heading */}
          <BlurFade delay={0.1} inView>
            <div className="flex flex-wrap items-baseline justify-between gap-y-2 font-mono-tabular">
              <h1 className="text-fluid-2xl sm:text-fluid-3xl tracking-tight text-foreground">
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
                      src={getSolutionImageUrl(solution)}
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

          {/* Previous / Next navigation */}
          <BlurFade delay={0.25} inView>
            <nav
              aria-label="Solution navigation"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border"
            >
              {previous ? (
                <Link
                  to={`/solutions/${previous.id}`}
                  className="group flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      previous
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-foreground truncate">
                      {previous.type === "daily"
                        ? `Daily — ${formatDateFull(previous.date)}`
                        : `Battle #${previous.battleNumber} — ${previous.name}`}
                    </span>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  to={`/solutions/${next.id}`}
                  className="group flex items-center justify-end gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col items-end min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      next
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-foreground truncate">
                      {next.type === "daily"
                        ? `Daily — ${formatDateFull(next.date)}`
                        : `Battle #${next.battleNumber} — ${next.name}`}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ) : (
                <div />
              )}
            </nav>
          </BlurFade>

          {/* Related / discovery links */}
          <BlurFade delay={0.3} inView>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <Link
                to={archivePath}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
              >
                {isDaily ? (
                  <Calendar className="w-4 h-4 text-primary" />
                ) : (
                  <Swords className="w-4 h-4 text-primary" />
                )}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    archive
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-foreground">
                    browse {isDaily ? "all daily targets" : "all battles"}
                  </span>
                </div>
              </Link>

              {latestDaily && latestDaily.id !== solution.id && (
                <Link
                  to={`/solutions/${latestDaily.id}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      latest daily
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-foreground truncate">
                      {formatDateFull(latestDaily.date)}
                    </span>
                  </div>
                </Link>
              )}

              {randomId && (
                <Link
                  to={`/solutions/${randomId}`}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                >
                  <Shuffle className="w-4 h-4 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      random
                    </span>
                    <span className="font-mono text-xs sm:text-sm text-foreground">
                      jump to a random solution
                    </span>
                  </div>
                </Link>
              )}

              <a
                href={solution.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    cssbattle
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-foreground">
                    view original target
                  </span>
                </div>
              </a>
            </div>
          </BlurFade>
        </div>
      </div>
    </>
  );
}
