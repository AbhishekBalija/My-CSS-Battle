import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const key = Array.isArray(data)
      ? data.map((d) => d["@type"]).join("-")
      : (data["@type"] as string) || "json-ld";
    const id = `json-ld-${key}`;

    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      (el as HTMLScriptElement).type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }

    el.textContent = JSON.stringify(data);
  }, [data]);

  return null;
}
