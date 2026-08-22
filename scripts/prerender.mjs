import { createServer } from "vite";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { targetImageMap } from "../src/generated/target-images.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.resolve(root, "dist");
const templatePath = path.resolve(dist, "index.html");

const BASE_URL = "https://www.cssbattledaily.site";
const SITE_NAME = "CSSBattle Daily";
const DEFAULT_TITLE =
  "CSSBattle Solutions & Daily Targets | CSSBattle Daily";
const DEFAULT_DESCRIPTION =
  "Browse CSSBattle daily target and battle solutions with short, code-golfed CSS, target previews, match scores, and exact character counts.";

const BATTLES_PER_PAGE = 24;
const DAILY_PER_PAGE = 28;

function loadSolutions() {
  const battlesPath = path.resolve(root, "data", "battles.json");
  const battles = JSON.parse(fs.readFileSync(battlesPath, "utf8"));

  const dailyDir = path.resolve(root, "data", "daily");
  const daily = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        daily.push(...JSON.parse(fs.readFileSync(full, "utf8")));
      }
    }
  }

  if (fs.existsSync(dailyDir)) {
    walk(dailyDir);
  }

  const all = [...daily, ...battles].filter(
    (s) => s && typeof s.score === "number" && s.score > 0,
  );

  return {
    daily,
    battles,
    all,
    dailySolved: daily.filter((s) => s.score > 0),
    battleSolved: battles.filter((s) => s.score > 0),
  };
}

function getTotalPages(totalItems, perPage) {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / perPage);
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr.includes("-")) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

function formatDateFull(dateStr) {
  const date = parseDate(dateStr);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function toIsoDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

function toAgentSolution(solution) {
  return {
    id: solution.id,
    name: solution.name,
    type: solution.type,
    battleNumber: solution.battleNumber,
    date: solution.date,
    score: solution.score,
    match: solution.match,
    characters: solution.characters,
    tags: solution.tags,
    url: `${BASE_URL}/solutions/${solution.id}`,
    targetImage: solution.targetImage,
    css: solution.code,
  };
}

function buildLlmsText(latestDaily) {
  const latestUrl = latestDaily
    ? `${BASE_URL}/solutions/${latestDaily.id}`
    : `${BASE_URL}/daily`;

  return `# CSSBattle Daily

> A public archive of CSS Battle solutions by Abhishek Balija, including daily targets, battle targets, scores, and golfed CSS source code.

## When to use CSSBattle Daily

Use this site when you need to:

- Look up the latest CSSBattle daily target solution archived by Abhishek.
- Retrieve CSS source code, score, match percentage, and character count for an archived solution.
- Browse solved daily targets by date or battle targets by battle number.
- Compare concise CSS golf approaches and discover techniques used in completed targets.

This is a personal solution archive, not the official CSSBattle service. A missing target means it has not been archived here; do not infer or invent a solution.

## Machine-readable data

- Latest daily solution: ${BASE_URL}/api/daily/latest.json
- All solved solutions: ${BASE_URL}/api/solutions.json
- OpenAPI description: ${BASE_URL}/openapi.json
- Latest daily solution page: ${latestUrl}

Use the JSON endpoints for reliable lookup. Each solution includes its ID, type, date or battle number, score, character count, canonical page URL, target image URL, tags, and CSS source code.

## Suggested agent workflow

1. Request the latest endpoint for the newest archived daily solution.
2. Use the all-solutions endpoint when searching by ID, date, or battle number.
3. Follow the canonical page URL in the JSON response when a human-readable explanation or target preview is useful.
4. Treat CSS here as code-golf output for CSSBattle, not production-ready frontend code.

## Human-readable pages

- Daily archive: ${BASE_URL}/daily
- Battle archive: ${BASE_URL}/battles
- XML sitemap: ${BASE_URL}/sitemap.xml
`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getOgImageDimensions(image) {
  if (image.endsWith(".svg")) {
    return { width: 1200, height: 630, type: "image/svg+xml" };
  }
  return { width: 400, height: 300, type: "image/png" };
}

function getRouteMeta(route, solutions) {
  const { all, dailySolved, battleSolved } = solutions;

  if (route === "/") {
    const authorId = `${BASE_URL}/#author`;

    return {
      title: "CSSBattle Solutions & Daily Targets",
      description: DEFAULT_DESCRIPTION,
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          alternateName: ["CSS Battle Solutions", "CSSBattle Solutions"],
          url: BASE_URL,
          description: DEFAULT_DESCRIPTION,
          author: { "@id": authorId },
        },
        {
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": authorId,
          name: "Abhishek Balija",
          url: BASE_URL,
          sameAs: [
            "https://github.com/AbhishekBalija",
            "https://x.com/AbhishekBalija1",
            "https://cssbattle.dev/player/AbhishekBalija1",
          ],
        },
      ],
    };
  }

  if (route === "/daily") {
    return {
      title: "CSSBattle Daily Target Solutions",
      description:
        "Browse CSSBattle daily target solutions by date with short, code-golfed CSS, target previews, match percentages, scores, and character counts.",
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "CSSBattle Daily Target Solutions",
        url: `${BASE_URL}/daily`,
        description:
          "Archive of CSSBattle daily target solutions with short, code-golfed CSS, scores, match percentages, and character counts.",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      },
    };
  }

  const dailyPageMatch = route.match(/^\/daily\/page\/(\d+)$/);
  if (dailyPageMatch) {
    const page = parseInt(dailyPageMatch[1], 10);
    return {
      title: `CSSBattle Daily Target Solutions – Page ${page}`,
      description:
        "Browse CSSBattle daily target solutions by date with short, code-golfed CSS, target previews, match percentages, scores, and character counts.",
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `CSSBattle Daily Target Solutions – Page ${page}`,
        url: `${BASE_URL}${route}`,
        description: `Page ${page} of CSSBattle daily target solutions.`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      },
    };
  }

  if (route === "/battles") {
    return {
      title: "CSSBattle Solutions by Battle",
      description:
        "Browse CSSBattle solutions by battle and target number. Compare short, code-golfed CSS, match scores, and exact character counts.",
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "CSSBattle Solutions by Battle",
        url: `${BASE_URL}/battles`,
        description:
          "Archive of CSSBattle solutions by target number with short, code-golfed CSS, scores, and exact character counts.",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      },
    };
  }

  const battlesPageMatch = route.match(/^\/battles\/page\/(\d+)$/);
  if (battlesPageMatch) {
    const page = parseInt(battlesPageMatch[1], 10);
    return {
      title: `CSSBattle Solutions by Battle – Page ${page}`,
      description:
        "Browse CSSBattle solutions by battle and target number. Compare short, code-golfed CSS, match scores, and exact character counts.",
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `CSSBattle Solutions by Battle – Page ${page}`,
        url: `${BASE_URL}${route}`,
        description: `Page ${page} of the CSSBattle solution archive.`,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      },
    };
  }

  if (route === "/analytics") {
    return {
      title: "CSSBattle Solution Analytics",
      description:
        "Explore CSSBattle solution analytics including daily streaks, battle scores, character counts, match percentages, heatmaps, and progress over time.",
      image: `${BASE_URL}/og-image.svg`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "CSSBattle Solution Analytics",
        url: `${BASE_URL}/analytics`,
        description: "CSSBattle solution analytics and progress tracking.",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      },
    };
  }

  const match = route.match(/^\/solutions\/(.+)$/);
  if (match) {
    const id = match[1];
    const solution = all.find((s) => s.id === id);
    if (solution) {
      const isDaily = solution.type === "daily";
      const title = isDaily
        ? `CSSBattle Daily Target Solution – ${formatDateFull(solution.date)}`
        : `CSSBattle #${solution.battleNumber}: ${solution.name} Solution`;
      const description = isDaily
        ? `CSSBattle daily target solution for ${formatDateFull(solution.date)}. See the target and code-golfed CSS in ${solution.characters} characters, with a ${solution.match?.toFixed(2)}% match and ${solution.score?.toFixed(2)} score.`
        : `CSSBattle #${solution.battleNumber} ${solution.name} code-golf solution. See the target and short CSS in ${solution.characters} characters, with a ${solution.match?.toFixed(2)}% match and ${solution.score?.toFixed(2)} score.`;
      const localImage = targetImageMap[solution.id]
        ? `${BASE_URL}${targetImageMap[solution.id]}`
        : null;
      const image = localImage || solution.targetImage || `${BASE_URL}/og-image.svg`;
      const url = `${BASE_URL}/solutions/${solution.id}`;

      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: isDaily ? "Daily Target Solutions" : "Battle Solutions",
            item: `${BASE_URL}${isDaily ? "/daily" : "/battles"}`,
          },
          { "@type": "ListItem", position: 3, name: title, item: url },
        ],
      };

      const webPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url,
        image,
        datePublished: solution.timestamp,
        author: {
          "@type": "Person",
          name: "Abhishek Balija",
          url: BASE_URL,
        },
        mainEntity: {
          "@type": "SoftwareSourceCode",
          name: title,
          programmingLanguage: "CSS",
          codeSampleType: "full",
          text: solution.code,
          url,
          author: { "@type": "Person", name: "Abhishek Balija" },
        },
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
      };

      return {
        title,
        description,
        image,
        jsonLd: [webPage, breadcrumb],
      };
    }
  }

  return {
    title: "Page Not Found",
    description: DEFAULT_DESCRIPTION,
    image: `${BASE_URL}/og-image.svg`,
  };
}

function buildHead(meta, route) {
  const fullTitle = meta.title
    ? `${meta.title} | ${SITE_NAME}`
    : DEFAULT_TITLE;
  const url = `${BASE_URL}${route}`;
  const ogDims = getOgImageDimensions(meta.image);

  const tags = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="index, follow" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<link rel="sitemap" type="application/xml" href="${BASE_URL}/sitemap.xml" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:image:width" content="${ogDims.width}" />`,
    `<meta property="og:image:height" content="${ogDims.height}" />`,
    `<meta property="og:image:type" content="${ogDims.type}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
  ];

  if (meta.prev) {
    tags.push(`<link rel="prev" href="${escapeHtml(`${BASE_URL}${meta.prev}`)}" />`);
  }
  if (meta.next) {
    tags.push(`<link rel="next" href="${escapeHtml(`${BASE_URL}${meta.next}`)}" />`);
  }

  if (meta.jsonLd) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`,
    );
  }

  return tags.join("\n");
}

function buildSitemap(urls) {
  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildSitemapIndex(sitemaps) {
  const entries = sitemaps
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${s.loc}</loc>${s.lastmod ? `\n    <lastmod>${s.lastmod}</lastmod>` : ""}\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

function stripSeoTags(html) {
  return html
    .replace(/<title>.*?<\/title>\s*/is, "")
    .replace(/<meta[^>]*name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*rel=["']sitemap["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*rel=["']prev["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]*rel=["']next["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*property=["']og:[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>\s*/gi, "")
    .replace(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
      "",
    );
}

async function main() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found. Run "vite build" first.`);
  }

  const solutions = loadSolutions();
  const { all, dailySolved, battleSolved } = solutions;

  const dailyPages = getTotalPages(dailySolved.length, DAILY_PER_PAGE);
  const battlePages = getTotalPages(battleSolved.length, BATTLES_PER_PAGE);

  const staticRoutes = ["/", "/daily", "/battles", "/analytics"];
  const dailyPaginatedRoutes = Array.from({ length: dailyPages - 1 }, (_, i) =>
    String(i + 2),
  ).map((p) => `/daily/page/${p}`);
  const battlesPaginatedRoutes = Array.from(
    { length: battlePages - 1 },
    (_, i) => String(i + 2),
  ).map((p) => `/battles/page/${p}`);
  const archiveRoutes = [
    ...staticRoutes,
    ...dailyPaginatedRoutes,
    ...battlesPaginatedRoutes,
  ];

  const solutionRoutes = all.map((s) => `/solutions/${s.id}`);
  const dailySolutionRoutes = dailySolved.map((s) => `/solutions/${s.id}`);
  const battleSolutionRoutes = battleSolved.map((s) => `/solutions/${s.id}`);
  const routes = [...archiveRoutes, ...solutionRoutes];

  console.log(
    `Prerendering ${routes.length} routes (${solutionRoutes.length} solution pages, ${dailyPaginatedRoutes.length} daily archive pages, ${battlesPaginatedRoutes.length} battles archive pages)...`,
  );

  const server = await createServer({
    root,
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const { render } = await server.ssrLoadModule("/src/entry-server.tsx");
    const template = fs.readFileSync(templatePath, "utf8");

    for (const route of routes) {
      const html = render(route);
      const meta = getRouteMeta(route, solutions);
      const head = buildHead(meta, route);

      let page = stripSeoTags(template);
      page = page.replace("</head>", `${head}\n</head>`);
      page = page.replace(
        /<div id="root"><\/div>/,
        `<div id="root">${html}</div>`,
      );

      let outPath;
      if (route === "/") {
        outPath = path.join(dist, "index.html");
      } else {
        const segments = route.split("/").filter(Boolean);
        const fileName = `${segments[segments.length - 1]}.html`;
        const dirPath = path.join(dist, ...segments.slice(0, -1));
        fs.mkdirSync(dirPath, { recursive: true });
        outPath = path.join(dirPath, fileName);
      }

      fs.writeFileSync(outPath, page);
      console.log(`  ${route} -> ${path.relative(root, outPath)}`);
    }
  } finally {
    await server.close();
  }

  const today = new Date().toISOString().split("T")[0];

  const pageUrls = [
    { loc: `${BASE_URL}/`, changefreq: "weekly", priority: "1.0" },
    { loc: `${BASE_URL}/daily`, changefreq: "daily", priority: "0.9" },
    { loc: `${BASE_URL}/battles`, changefreq: "weekly", priority: "0.9" },
    { loc: `${BASE_URL}/analytics`, changefreq: "weekly", priority: "0.7" },
    ...dailyPaginatedRoutes.map((r) => ({
      loc: `${BASE_URL}${r}`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.8",
    })),
    ...battlesPaginatedRoutes.map((r) => ({
      loc: `${BASE_URL}${r}`,
      lastmod: today,
      changefreq: "weekly",
      priority: "0.8",
    })),
  ];

  const solutionUrls = battleSolutionRoutes.map((r) => {
    const solution = battleSolved.find((s) => `/solutions/${s.id}` === r);
    return {
      loc: `${BASE_URL}${r}`,
      lastmod: toIsoDate(solution?.timestamp),
      changefreq: "weekly",
      priority: "0.8",
    };
  });

  const dailyUrls = dailySolutionRoutes.map((r) => {
    const solution = dailySolved.find((s) => `/solutions/${s.id}` === r);
    return {
      loc: `${BASE_URL}${r}`,
      lastmod: toIsoDate(solution?.timestamp),
      changefreq: "daily",
      priority: "0.8",
    };
  });

  const pagesSitemap = buildSitemap(pageUrls);
  const solutionsSitemap = buildSitemap(solutionUrls);
  const dailySitemap = buildSitemap(dailyUrls);
  const latestDaily = [...dailySolved].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime(),
  ).at(-1);
  const apiDir = path.join(dist, "api");
  const latestDailyDir = path.join(apiDir, "daily");

  fs.mkdirSync(latestDailyDir, { recursive: true });
  fs.writeFileSync(
    path.join(apiDir, "solutions.json"),
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      count: all.length,
      solutions: all.map(toAgentSolution),
    }, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(latestDailyDir, "latest.json"),
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      solution: latestDaily ? toAgentSolution(latestDaily) : null,
    }, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(dist, "llms.txt"), buildLlmsText(latestDaily));

  fs.writeFileSync(path.join(dist, "sitemap-pages.xml"), pagesSitemap);
  fs.writeFileSync(path.join(dist, "sitemap-solutions.xml"), solutionsSitemap);
  fs.writeFileSync(path.join(dist, "sitemap-daily.xml"), dailySitemap);

  const sitemapIndex = buildSitemapIndex([
    { loc: `${BASE_URL}/sitemap-pages.xml`, lastmod: today },
    { loc: `${BASE_URL}/sitemap-solutions.xml`, lastmod: today },
    { loc: `${BASE_URL}/sitemap-daily.xml`, lastmod: today },
  ]);
  fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemapIndex);

  fs.writeFileSync(path.join(root, "public", "sitemap-pages.xml"), pagesSitemap);
  fs.writeFileSync(
    path.join(root, "public", "sitemap-solutions.xml"),
    solutionsSitemap,
  );
  fs.writeFileSync(path.join(root, "public", "sitemap-daily.xml"), dailySitemap);
  fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemapIndex);

  console.log(`Wrote sitemap index + 3 sub-sitemaps:`);
  console.log(`  - sitemap-pages.xml (${pageUrls.length} URLs)`);
  console.log(`  - sitemap-solutions.xml (${solutionUrls.length} URLs)`);
  console.log(`  - sitemap-daily.xml (${dailyUrls.length} URLs)`);
  console.log(`  - api/solutions.json (${all.length} solutions)`);
  console.log(`  - api/daily/latest.json`);
  console.log(`  - llms.txt`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
