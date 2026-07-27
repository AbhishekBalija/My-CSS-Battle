import { useState } from "react";

interface TargetImageProps {
  src: string | null;
  colors: string[];
  alt?: string;
  className?: string;
}

export default function TargetImage({
  src,
  colors,
  alt,
  className,
}: TargetImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const bgColor = colors?.[0] || "#1a1a1a";
  const accentColor = colors?.[1] || "#F3AC3C";

  const hasError = failedSrc === src;

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: bgColor }}
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
      onError={() => setFailedSrc(src)}
      loading="lazy"
    />
  );
}
