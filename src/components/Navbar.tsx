import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Terminal, Menu, X, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/daily", label: "Daily" },
  { to: "/battles", label: "Battles" },
  { to: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border",
        isHome ? "bg-background/80 backdrop-blur-md" : "bg-background",
      )}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight"
        >
          <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="text-foreground">abhi</span>
          <span className="text-muted-foreground">.css</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-3 py-1.5 text-sm font-mono transition-colors rounded-sm",
                isActive(link.to)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-(--nav-hover-text) hover:bg-(--nav-hover-bg)",
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/AbhishekBalija/cssbattle-tracker-extension"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get extension
            <ExternalLink className="w-3 h-3" />
          </a>
          <AnimatedThemeToggler
            fromCenter
            variant="circle"
            className="ml-2 flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shrink-0"
          />
        </div>

        {/* Mobile hamburger + theme */}
        <div className="flex sm:hidden items-center gap-1">
          <AnimatedThemeToggler
            fromCenter
            variant="circle"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors shrink-0"
          />
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="sm:hidden overflow-hidden border-t border-border bg-background/95 backdrop-blur-md"
          >
            <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-3 text-sm font-mono transition-colors rounded-sm",
                    isActive(link.to)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-(--nav-hover-text) hover:bg-(--nav-hover-bg)",
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://github.com/AbhishekBalija/cssbattle-tracker-extension"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-3 text-sm font-mono transition-colors rounded-sm text-primary bg-primary/10 hover:bg-primary/20 inline-flex items-center gap-1.5"
              >
                Get extension
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
