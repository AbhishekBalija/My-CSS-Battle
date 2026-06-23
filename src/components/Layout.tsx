import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Global glowing dot pattern background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 text-primary/40"
      >
        <DotPattern
          glow
          width={22}
          height={22}
          cr={1.4}
          className="mask-[radial-gradient(700px_circle_at_center,white,transparent)]"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
