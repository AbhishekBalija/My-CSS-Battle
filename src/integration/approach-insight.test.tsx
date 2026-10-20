import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ApproachInsight from "@/components/solutions/ApproachInsight";
import { mirrorBestApproach, validateSolutionRecord } from "@/lib/approach-contract";
import { getOrderedApproaches, getSolutionApproaches } from "@/lib/approaches";
import type { Solution, SolutionApproach } from "@/types";

const base: Solution = {
  id: "target",
  name: "Target",
  type: "daily",
  score: 0,
  match: 0,
  characters: 0,
  colors: [],
  date: "2026-10-20",
  timestamp: "2026-10-20T12:00:00.000Z",
  tags: [],
  url: "https://cssbattle.dev/play/target",
  targetImage: "https://cssbattle.dev/targets/target.png",
  code: "",
};

const grid: SolutionApproach = {
  id: "grid",
  label: "Grid",
  score: 720,
  match: 100,
  characters: 90,
  timestamp: "2026-10-20T12:00:00.000Z",
  tags: [],
  code: "<style>&{display:grid;place-items:center}",
  insight: "place-items centers both axes in one line",
};

const flex: SolutionApproach = {
  id: "flex",
  label: "Flex",
  score: 710,
  match: 100,
  characters: 110,
  timestamp: "2026-10-20T12:00:00.000Z",
  tags: [],
  code: "<style>&{display:flex;align-items:center}",
};

// A target with two approaches: one carries an insight, one does not.
const multiSolution = mirrorBestApproach(base, [flex, grid]);

describe("approach insight from record to page", () => {
  it("accepts the multi-approach fixture", () => {
    expect(validateSolutionRecord(multiSolution)).toEqual([]);
  });

  it("renders insight for approach that has one", () => {
    const [best] = getOrderedApproaches(multiSolution);
    expect(best!.id).toBe("grid");
    expect(renderToStaticMarkup(<ApproachInsight insight={best!.insight} />)).toContain(
      "place-items centers both axes in one line",
    );
  });

  it("renders nothing for approach without insight", () => {
    const other = getOrderedApproaches(multiSolution)[1]!;
    expect(other.id).toBe("flex");
    expect(renderToStaticMarkup(<ApproachInsight insight={other.insight} />)).toBe("");
  });

  it("renders insight as text", () => {
    const markup = renderToStaticMarkup(<ApproachInsight insight="<script>x</script>" />);
    expect(markup).toContain("&lt;script&gt;");
    expect(markup).not.toContain("<script>");
  });

  it("legacy record shows no insight", () => {
    const legacy = { ...base, code: "<style>&{}", insight: "stray" } as Solution;
    expect(getSolutionApproaches(legacy)[0]!.insight).toBeUndefined();
  });
});
