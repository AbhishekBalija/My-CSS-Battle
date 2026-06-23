import { Link } from "react-router-dom";
import { Terminal, ArrowLeft, Home } from "lucide-react";
import SEO from "@/components/SEO";
import { BlurFade } from "@/components/ui/blur-fade";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShineBorder } from "@/components/ui/shine-border";
import { TypingAnimation } from "@/components/ui/typing-animation";

export default function PageNotFound() {
  return (
    <>
      <SEO title="404 — Page Not Found" description="This CSS Battle solution doesn't exist. It might not have been solved yet, or the URL is incorrect." />
      <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Background dots */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 text-primary/30"
      >
        <DotPattern
          glow
          width={22}
          height={22}
          cr={1.2}
          className="mask-[radial-gradient(600px_circle_at_center,white,transparent)]"
        />
      </div>

      {/* Nav bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
          >
            <Terminal className="w-4 h-4 text-primary" />
            <span className="text-foreground">abhi</span>
            <span className="text-muted-foreground">.css</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-xs font-mono text-foreground rounded-full transition-colors"
          >
            <Home className="w-3 h-3" /> Home
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* 404 with decorative brackets */}
          <BlurFade delay={0.05} inView>
            <div className="relative inline-flex items-center justify-center">
              <span className="absolute -left-8 sm:-left-14 font-mono-tabular text-[100px] sm:text-[150px] leading-none text-primary/25 select-none pointer-events-none">
                {"{"}
              </span>
              <h1 className="font-mono-tabular text-[120px] sm:text-[180px] leading-none tracking-tighter text-foreground select-none">
                4<span className="text-primary">0</span>4
              </h1>
              <span className="absolute -right-8 sm:-right-14 font-mono-tabular text-[100px] sm:text-[150px] leading-none text-primary/25 select-none pointer-events-none">
                {"}"}
              </span>
            </div>
          </BlurFade>

          {/* Terminal-style error message */}
          <BlurFade delay={0.15} inView>
            <div className="hairline rounded-lg bg-surface/60 p-4 w-full max-w-lg text-left backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-warn/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-primary/50" />
                <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider uppercase">
                  terminal — error
                </span>
              </div>
              <TypingAnimation
                children="target not found: solution doesn't exist."
                startOnView
                showCursor
                className="font-mono text-xs sm:text-sm text-muted-foreground whitespace-nowrap"
              />
            </div>
          </BlurFade>

          {/* VoiceLine-style hint */}
          <BlurFade delay={0.3} inView>
            <p className="italic text-sm text-muted-foreground/80 max-w-sm">
              maybe you typed a wrong selector. maybe the target was never
              solved. either way, there's nothing here.
            </p>
          </BlurFade>

          {/* CTA buttons with shine */}
          <BlurFade delay={0.4} inView>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/"
                className="group relative rounded-full overflow-hidden"
              >
                <ShineBorder
                  shineColor="var(--shine-color)"
                  borderWidth={2}
                  duration={8}
                  className="rounded-full"
                />
                <span className="relative z-10 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-mono text-xs font-medium rounded-full">
                  <Home className="w-3.5 h-3.5" />
                  back to home
                </span>
              </Link>
              <Link
                to="/daily"
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-mono text-xs font-medium rounded-full transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                browse daily targets
              </Link>
            </div>
          </BlurFade>

          {/* CSS snippet decoration */}
          <BlurFade delay={0.5} inView>
            <div className="font-mono text-[10px] text-muted-foreground/40 leading-relaxed text-left max-w-xs">
              <div>{"/* you are here */"}</div>
              <div>
                <span className="text-primary/50">body</span>
                <span className="text-muted-foreground/40">{" {"}</span>
              </div>
              <div className="pl-4">
                <span className="text-muted-foreground/40">display: </span>
                <span className="text-warn/40">lost</span>
                <span className="text-muted-foreground/40">;</span>
              </div>
              <div className="pl-4">
                <span className="text-muted-foreground/40">position: </span>
                <span className="text-primary/40">absolute</span>
                <span className="text-muted-foreground/40">;</span>
              </div>
              <div>
                <span className="text-muted-foreground/40">{"}"}</span>
              </div>
            </div>
          </BlurFade>
        </div>
      </main>
    </div>
    </>
  );
}
