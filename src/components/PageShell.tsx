import { BlurFade } from "@/components/ui/blur-fade";
import SEO from "./SEO";
import VoiceLine from "./VoiceLine";

interface PageShellProps {
  title: string;
  description: string;
  path: string;
  heading: string;
  voiceLine: string;
  children: React.ReactNode;
}

export default function PageShell({
  title,
  description,
  path,
  heading,
  voiceLine,
  children,
}: PageShellProps) {
  return (
    <>
      <SEO title={title} description={description} path={path} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col gap-8">
          <BlurFade delay={0.05} inView>
            <header>
              <h1 className="font-mono-tabular text-3xl tracking-tight text-foreground">
                {heading}
              </h1>
              <VoiceLine className="mt-2 text-sm">{voiceLine}</VoiceLine>
            </header>
          </BlurFade>
          {children}
        </div>
      </div>
    </>
  );
}
