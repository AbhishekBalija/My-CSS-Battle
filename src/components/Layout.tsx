import { useEffect } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { DotPattern } from "@/components/ui/dot-pattern";
import { useScrollToTop } from "@/components/motion/scroll-top";
import { usePageMorph } from "@/components/motion/usePageMorph";

export default function Layout() {
  const location = useLocation();
  const scrollToTop = useScrollToTop();

  // Page changes run inside a View Transition (slide + card image morph)
  usePageMorph(scrollToTop);

  // Each new page starts at the top (also covers browsers without View Transitions)
  useEffect(() => {
    scrollToTop();
  }, [location.pathname, scrollToTop]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      <div
        aria-hidden
        className="vt-bg pointer-events-none fixed inset-0 z-0 text-primary/40"
      >
        <DotPattern
          glow
          width={22}
          height={22}
          cr={1.4}
          className="mask-[radial-gradient(80%_60%_at_center,white,transparent)]"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {/* data-route lets the page transition know the new page has rendered */}
          <div key={location.pathname} data-route={location.pathname}>
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
