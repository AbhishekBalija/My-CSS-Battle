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
  const hasGradient = lower.includes("gradient");

  if (elementCount >= 2) return { label: "multi-element" };
  if (hasNestedTemplate) return { label: "nested template" };
  if (elementCount === 1) return { label: "single element" };
  if (hasRootRule && hasGradient) return { label: "all gradient" };
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
  return tags;
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
