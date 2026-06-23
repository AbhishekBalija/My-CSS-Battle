import type { ReactNode } from "react";

export default function VoiceLine({
  children,
  className = "",
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}) {
  return (
    <Tag
      className={`italic text-muted-foreground/90 ${className}`}
      style={{ fontWeight: 400 }}
    >
      {children}
    </Tag>
  );
}
