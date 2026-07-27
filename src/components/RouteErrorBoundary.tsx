import { Component, type ErrorInfo, type ReactNode } from "react";

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Label used in the fallback message, e.g. "analytics" */
  label?: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render and lazy-chunk load errors so a single route failure
 * does not white-screen the whole app.
 */
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RouteErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const label = this.props.label ?? "page";
      return (
        <div
          role="alert"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center"
        >
          <p className="font-mono text-sm text-warn mb-2">
            failed to load {label}
          </p>
          <p className="font-mono text-xs text-muted-foreground mb-6 max-w-md mx-auto">
            {this.state.error?.message ||
              "Something went wrong loading this route. The chunk may have failed to download."}
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 font-mono text-xs text-foreground hover:border-primary/50 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
