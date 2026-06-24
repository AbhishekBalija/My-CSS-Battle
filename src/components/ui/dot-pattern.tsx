import React, { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  cr?: number;
  className?: string;
  glow?: boolean;
  glowCount?: number;
  [key: string]: unknown;
}

interface DotData {
  x: number;
  y: number;
  glow: boolean;
  delay: number;
  duration: number;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  glowCount = 100,
  ...props
}: DotPatternProps) {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [dots, setDots] = useState<DotData[]>([]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const cols = Math.ceil(dimensions.width / width);
    const rows = Math.ceil(dimensions.height / height);
    const total = cols * rows;

    // Pick which dot indices will glow, spread roughly evenly across the grid.
    const glowIndices = new Set<number>();
    const step = Math.max(1, Math.floor(total / glowCount));
    let seed = 0;
    for (let i = 0; i < total && glowIndices.size < glowCount; i += step) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const jitter = seed % step;
      const idx = Math.min(total - 1, i + jitter);
      glowIndices.add(idx);
    }

    const next: DotData[] = Array.from({ length: total }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const isGlow = glow && glowIndices.has(i);
      return {
        x: col * width + cx + x,
        y: row * height + cy + y,
        glow: isGlow,
        delay: isGlow ? Math.random() * 5 : 0,
        duration: isGlow ? Math.random() * 3 + 2 : 0,
      };
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDots(next);
  }, [dimensions, width, height, cx, cy, x, y, glow, glowCount]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-neutral-400/80",
        className
      )}
      {...props}
    >
      <defs>
        <radialGradient id={`${id}-gradient`}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {dots.map((dot) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={cr}
          fill={glow ? `url(#${id}-gradient)` : "currentColor"}
          className={dot.glow ? "animate-dot-glow" : undefined}
          style={
            dot.glow
              ? {
                  animationDelay: `${dot.delay}s`,
                  animationDuration: `${dot.duration}s`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
