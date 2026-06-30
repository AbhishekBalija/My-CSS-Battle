import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
}

function pagePath(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}

export default function Pagination({
  basePath,
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      start = 2;
      end = Math.min(totalPages - 1, maxVisible - 1);
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - maxVisible + 2;
      end = totalPages - 1;
    }

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 pt-6"
    >
      {currentPage > 1 ? (
        <Link
          to={pagePath(basePath, currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono text-foreground hover:border-primary/50 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> prev
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs font-mono text-muted-foreground cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" /> prev
        </span>
      )}

      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, i) =>
          typeof p === "string" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-2 text-xs font-mono text-muted-foreground"
            >
              {p}
            </span>
          ) : (
            <Link
              key={p}
              to={pagePath(basePath, p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${
                p === currentPage
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      <span className="sm:hidden px-3 py-2 text-xs font-mono text-muted-foreground">
        page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Link
          to={pagePath(basePath, currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono text-foreground hover:border-primary/50 transition-colors"
        >
          next <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-muted/20 text-xs font-mono text-muted-foreground cursor-not-allowed">
          next <ChevronRight className="w-3.5 h-3.5" />
        </span>
      )}
    </nav>
  );
}
