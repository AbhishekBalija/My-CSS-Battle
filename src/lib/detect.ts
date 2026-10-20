export interface DetectedTechnique {
  label: string;
}

function countElements(code: string): number {
  return (
    code.match(/<(?!\/|style\b)[a-z][\w-]*(?:\s[^>]*)?>/gi) || []
  ).length;
}

function detectPrimaryApproach(
  code: string,
  lower: string,
): DetectedTechnique {
  const elementCount = countElements(code);
  const hasNestedTemplate =
    /(?:&|\*)\s*\{[\s\S]*\*\s*\{/.test(code) ||
    /&\s*>\s*\*\s*\{/.test(code);
  const hasRootRule = /(?:&|body)\s*\{/.test(lower);

  // A root rule that sets anything besides backgrounds and css vars
  // (margin, border, size...) is shaping the box, not just painting it.
  const properties = [...lower.matchAll(/(?:^|[{;])\s*(-{0,2}[a-z][\w-]*)\s*:/g)].map(
    (match) => match[1]!,
  );
  const shapesBox = properties.some(
    (prop) => !prop.startsWith("--") && !prop.startsWith("background"),
  );

  // Names match the author's saved approach labels. One tag counts as a
  // single element even when its styles are nested. A root rule that shapes
  // the box is a nested template; one that only paints is "background only".
  // Gradients, borders etc. show up as techniques, not approaches.
  if (elementCount >= 2) return { label: "multiple elements" };
  if (elementCount === 1) return { label: "single element" };
  if (hasNestedTemplate) return { label: "nested template" };
  if (hasRootRule && shapesBox) return { label: "nested template" };
  if (hasRootRule) return { label: "background only" };
  return { label: "something else" };
}

function detectGradientTypes(lower: string): DetectedTechnique[] {
  const tags: DetectedTechnique[] = [];
  if (lower.includes("repeating-")) tags.push({ label: "repeating gradient" });
  if (lower.includes("conic-gradient")) tags.push({ label: "conic" });
  if (lower.includes("radial-gradient")) tags.push({ label: "radial" });
  if (lower.includes("linear-gradient")) tags.push({ label: "linear" });
  return tags;
}

const techniqueRules: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bbox-shadow\s*:/, "box-shadow"],
  [/\bcorner-shape\s*:/, "corner-shape"],
  [/\bclip-path\s*:/, "clip-path"],
  [/\bmask(?:-image)?\s*:/, "mask"],
  [/\bborder-radius\s*:/, "border-radius"],
  [/\bborder\s*:/, "border"],
  [/\bborder-image\s*:/, "border-image"],
  [/\boutline\s*:/, "outline"],
  [/\b(?:transform|rotate|scale)\s*:/, "transform"],
  [/\bfilter\s*:/, "filter"],
  [/&\s*>\s*\*\s*\{/, "direct-child selector"],
  [/::?before|::?after/, "pseudo-element"],
  [/\bdisplay\s*:\s*flex|\bflex\s*:/, "flexbox"],
  [/\bdisplay\s*:\s*grid|\bgrid(?:-template)?\s*:/, "grid"],
];

function detectTechniquesByRule(lower: string): DetectedTechnique[] {
  return techniqueRules.flatMap(([pattern, label]) =>
    pattern.test(lower) ? [{ label }] : [],
  );
}

function detectPositioning(lower: string): DetectedTechnique[] {
  const usesMarginOrTranslate =
    /\bmargin(?:-[a-z]+)?\s*:/.test(lower) ||
    /\btranslate(?:[xyz])?\s*:|\btranslate(?:[xyz])?\(/.test(lower);

  return usesMarginOrTranslate ? [{ label: "margin positioning" }] : [];
}

function detectUtilities(lower: string): DetectedTechnique[] {
  const tags: DetectedTechnique[] = [];
  if (/--[\w-]+\s*:/.test(lower)) tags.push({ label: "css vars" });
  if (lower.includes("calc(")) tags.push({ label: "calc()" });
  if (lower.includes("attr(")) tags.push({ label: "attr()" });
  return tags;
}

/** The one overall strategy of a solve (e.g. "nested template"), no CSS features. */
export function detectApproach(code: string): string {
  if (!code) return "something else";
  return detectPrimaryApproach(code, code.toLowerCase()).label;
}

export function detectTechniques(code: string): DetectedTechnique[] {
  if (!code) return [{ label: "something else" }];
  const lower = code.toLowerCase();
  const detected = [
    detectPrimaryApproach(code, lower),
    ...detectGradientTypes(lower),
    ...detectPositioning(lower),
    ...detectTechniquesByRule(lower),
    ...detectUtilities(lower),
  ];
  const seen = new Set<string>();

  return detected.filter(({ label }) => {
    if (seen.has(label)) return false;
    seen.add(label);
    return true;
  });
}
