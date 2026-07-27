import { useEffect } from "react";

import { BASE_URL, SITE_NAME } from "@/lib/seo";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  prev?: string;
  next?: string;
}

function setOrCreateTag(
  selector: string,
  tagName: string,
  attributes: Record<string, string>,
  content?: string,
) {
  if (typeof document === "undefined") return;

  let el = document.head.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    el!.setAttribute(key, value);
  });

  if (content !== undefined) {
    el.textContent = content;
  }
}

function removeOldTags(selector: string) {
  if (typeof document === "undefined") return;
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
}

function updateHead({
  title,
  description = "Minimal CSS Battle solutions with golfed code. Browse solved targets, daily challenges, and analytics. Pure CSS art, under 300 characters.",
  path = "",
  image = `${BASE_URL}/og-image.svg`,
  imageWidth,
  imageHeight,
  imageType,
  prev,
  next,
}: SEOProps) {
  if (typeof document === "undefined") return;

  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — Minimal CSS Art & Code Golf`;
  const url = `${BASE_URL}${path}`;

  document.title = fullTitle;

  setOrCreateTag('meta[name="description"]', "meta", { name: "description" }, description);
  setOrCreateTag('meta[name="robots"]', "meta", { name: "robots" }, "index, follow");

  removeOldTags('link[rel="canonical"]');
  setOrCreateTag('link[rel="canonical"]', "link", { rel: "canonical", href: url });

  removeOldTags('link[rel="sitemap"]');
  setOrCreateTag(
    'link[rel="sitemap"]',
    "link",
    { rel: "sitemap", type: "application/xml", href: `${BASE_URL}/sitemap.xml` },
  );

  removeOldTags('link[rel="prev"]');
  if (prev) {
    setOrCreateTag('link[rel="prev"]', "link", { rel: "prev", href: `${BASE_URL}${prev}` });
  }

  removeOldTags('link[rel="next"]');
  if (next) {
    setOrCreateTag('link[rel="next"]', "link", { rel: "next", href: `${BASE_URL}${next}` });
  }

  const ogTags: Record<string, string> = {
    "og:type": "website",
    "og:site_name": SITE_NAME,
    "og:title": fullTitle,
    "og:description": description,
    "og:url": url,
    "og:image": image,
  };

  if (imageWidth) ogTags["og:image:width"] = String(imageWidth);
  if (imageHeight) ogTags["og:image:height"] = String(imageHeight);
  if (imageType) ogTags["og:image:type"] = imageType;

  Object.entries(ogTags).forEach(([property, content]) => {
    setOrCreateTag(`meta[property="${property}"]`, "meta", { property }, content);
  });

  const twitterTags: Record<string, string> = {
    "twitter:card": "summary_large_image",
    "twitter:title": fullTitle,
    "twitter:description": description,
    "twitter:image": image,
  };

  Object.entries(twitterTags).forEach(([name, content]) => {
    setOrCreateTag(`meta[name="${name}"]`, "meta", { name }, content);
  });
}

export default function SEO({
  title,
  description,
  path,
  image,
  imageWidth,
  imageHeight,
  imageType,
  prev,
  next,
}: SEOProps) {
  useEffect(() => {
    updateHead({
      title,
      description,
      path,
      image,
      imageWidth,
      imageHeight,
      imageType,
      prev,
      next,
    });
  }, [title, description, path, image, imageWidth, imageHeight, imageType, prev, next]);

  return null;
}
