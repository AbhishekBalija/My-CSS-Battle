import { useState } from "react";

interface TargetImageProps {
  src: string | null;
  colors: string[];
  alt?: string;
  className?: string;
  /** Same id on a card and on the solution page lets the image morph between them */
  morphId?: string;
}

export default function TargetImage({
  src,
  colors,
  alt,
  className,
  morphId,
}: TargetImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const bgColor = colors?.[0] || "var(--surface-2)";
  const accentColor = colors?.[1] || "#F3AC3C";

  const hasError = failedSrc === src;
  // Becomes the view-transition-name during page changes (see index.css)
  const morphProps = morphId
    ? { "data-morph": morphId, style: { "--morph-name": `target-${morphId}` } as React.CSSProperties }
    : {};

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        {...morphProps}
        style={{ background: bgColor, ...morphProps.style }}
      >
        <div
          className="w-1/3 h-1/3 opacity-30"
          style={{ background: accentColor }}
        />
      </div>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt || "CSSBattle target"}
      className={className}
      {...morphProps}
      onError={() => setFailedSrc(src)}
      loading="lazy"
    />
  );
}
