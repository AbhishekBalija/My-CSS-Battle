import SEO from "@/components/SEO";
import DailyTargetsStrip from "@/components/daily/DailyTargetStrip";
import BattleStrip from "@/components/battles/BattleStrip";
import Hero from "../components/Hero";
import { BlurFade } from "@/components/ui/blur-fade";

function Home() {
  return (
    <>
      <SEO
        title="Home"
        description="CSS Battle solutions with golfed code. Browse solved targets, daily challenges, and personal analytics. Pure CSS art and code golf."
        path="/"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-col gap-12 sm:gap-16">
        <BlurFade delay={0.05} inView>
          <Hero />
        </BlurFade>

        <BlurFade delay={0.15} inView>
          <DailyTargetsStrip />
        </BlurFade>

        <BlurFade delay={0.25} inView>
          <BattleStrip />
        </BlurFade>
      </div>
    </div>
    </>
  );
}

export default Home;
