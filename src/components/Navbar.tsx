import { Link, useLocation } from "react-router-dom";
import { Terminal } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/daily", label: "Daily" },
  { to: "/battles", label: "Battles" },
  { to: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border ${isHome ? "bg-background/80 backdrop-blur-md" : "bg-background"}`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
        >
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-foreground">abhi</span>
          <span className="text-muted-foreground">.css</span>
        </Link>
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navLinks.map((link) => {
            const active =
              location.pathname === link.to ||
              (link.to !== "/" && location.pathname.startsWith(link.to));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-mono transition-colors rounded-sm ${
                  active
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-(--nav-hover-text) hover:bg-(--nav-hover-bg)"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <AnimatedThemeToggler
            fromCenter
            variant="circle"
            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          />
        </div>
      </nav>
    </header>
  );
}
