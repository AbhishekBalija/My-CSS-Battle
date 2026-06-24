function detectPrimaryApproach(
  code: string,
  lower: string
): { label: string } {
  const pCount = (code.match(/<p/g) || []).length;
  const hasNested = /&\{.*\*\{|&\{.*\{[^}]*\}/.test(code);
  const hasAmpBody = /&\{|body\{/.test(lower);
  const hasGradient = /gradient/.test(lower);

  if (pCount >= 2) return { label: "multi-element" };
  if (hasNested) return { label: "nested template" };
  if (hasAmpBody && hasGradient && pCount === 0) return { label: "all gradient" };
  if (hasAmpBody) return { label: "& selector" };
  if (pCount === 1) return { label: "single element" };
  return { label: "something else" };
}

function detectGradientTypes(lower: string): Array<{ label: string }> {
  const tags: Array<{ label: string }> = [];
  if (lower.includes("conic-gradient")) tags.push({ label: "conic" });
  if (lower.includes("radial-gradient")) tags.push({ label: "radial" });
  if (lower.includes("linear-gradient")) tags.push({ label: "linear" });
  return tags;
}

const shapeRules: [string, string][] = [
  ["border-radius", "border-radius"],
  ["corner-shape", "border-radius"],
  ["box-shadow", "box-shadow"],
  ["transform", "transform"],
  ["rotate", "transform"],
  ["translate", "transform"],
  ["scale", "transform"],
  ["inset", "inset"],
];

function detectShapeTools(lower: string, code: string): Array<{ label: string }> {
  const tags: Array<{ label: string }> = [];
  const found = new Set<string>();
  for (const [keyword, label] of shapeRules) {
    if (lower.includes(keyword) && !found.has(label)) {
      found.add(label);
      tags.push({ label });
    }
  }
  if (lower.includes("margin:") && code.match(/\d+\s+\d+/))
    tags.push({ label: "margin positioning" });
  return tags;
}

function detectUtilities(lower: string): Array<{ label: string }> {
  const tags: Array<{ label: string }> = [];
  if (lower.includes("--")) tags.push({ label: "css vars" });
  if (lower.includes("calc(")) tags.push({ label: "calc()" });
  return tags;
}

function detectRareTools(lower: string): Array<{ label: string }> {
  const tags: Array<{ label: string }> = [];
  if (lower.includes("clip-path")) tags.push({ label: "clip-path" });
  if (lower.includes("flex")) tags.push({ label: "flexbox" });
  if (lower.includes("grid")) tags.push({ label: "grid" });
  return tags;
}

export function detectTechniques(code: string): Array<{ label: string }> {
  if (!code) return [{ label: "something else" }];
  const lower = code.toLowerCase();

  return [
    detectPrimaryApproach(code, lower),
    ...detectGradientTypes(lower),
    ...detectShapeTools(lower, code),
    ...detectUtilities(lower),
    ...detectRareTools(lower),
  ];
}
