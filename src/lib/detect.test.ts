import { describe, expect, it } from "vitest";
import { detectTechniques } from "./detect";

function labelsFor(code: string): string[] {
  return detectTechniques(code).map(({ label }) => label);
}

describe("detectTechniques", () => {
  it("recognizes a nested template with box-shadow", () => {
    const labels = labelsFor(
      "<style>&{margin:102px 112px;background:#57c4c4;*{box-shadow:inset 2in 0}}",
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        "nested template",
        "margin positioning",
        "box-shadow",
      ]),
    );
  });

  it("recognizes multiple elements using gradients and translate positioning", () => {
    const labels = labelsFor(
      "<p><p><style>p{background:linear-gradient(red,blue);translate:5px 2px}",
    );

    expect(labels).toEqual(
      expect.arrayContaining(["multiple elements", "linear", "margin positioning"]),
    );
  });

  it("calls a gradient background without elements background only", () => {
    const labels = labelsFor(
      "<style>&{background:conic-gradient(red 25%,blue 0),radial-gradient(red,blue)}",
    );

    expect(labels).toEqual(
      expect.arrayContaining(["background only", "conic", "radial"]),
    );
  });

  it("recognizes a single element with a gradient and box-shadow", () => {
    const labels = labelsFor(
      "<p><style>p{background:linear-gradient(red,blue);box-shadow:5px 5px red}",
    );

    expect(labels).toEqual(
      expect.arrayContaining(["single element", "linear", "box-shadow"]),
    );
  });

  it("detects corner-shape separately from border-radius", () => {
    const labels = labelsFor(
      "<style>&{corner-shape:square notch;border-radius:5pc}",
    );

    expect(labels).toEqual(
      expect.arrayContaining(["corner-shape", "border-radius"]),
    );
  });

  it("recognizes nested universal selectors as a nested template", () => {
    const labels = labelsFor(
      "<style>*{background:conic-gradient(red 25%,blue 0);*{margin:40;outline:5px solid}",
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        "nested template",
        "conic",
        "margin positioning",
        "outline",
      ]),
    );
  });

  it("keeps multiple elements as the structure for direct-child selectors", () => {
    const labels = labelsFor(
      "<p><p><p><style>&>*{margin:27px 70px;display:flex}",
    );

    expect(labels).toEqual(
      expect.arrayContaining([
        "multiple elements",
        "direct-child selector",
        "margin positioning",
        "flexbox",
      ]),
    );
  });

  it("calls one <p> with nested styles a single element, like the saved labels do", () => {
    const labels = labelsFor(
      "<p><style>&{background:red;*{margin:50 35;p{height:50;box-shadow:0 95q red}}}",
    );

    expect(labels).toContain("single element");
    expect(labels).not.toContain("nested template");
  });

  it("detects attr() and border-image", () => {
    const labels = labelsFor(
      "<p r=9><style>p{border-radius:attr(r px);border-image:linear-gradient(red,blue) 1}",
    );

    expect(labels).toEqual(expect.arrayContaining(["attr()", "border-image"]));
  });

  it("calls a root rule that shapes the box (border, margin...) a nested template", () => {
    const withBorder = labelsFor(
      "<style>&{border:solid#73493A;border-width:65 115;background:conic-gradient(at 60px 53q,#FEF9CE 75%,#A6BA86 0)0 30vw/110px",
    );
    const withMargin = labelsFor(
      "<style>&{margin:105 130;background:conic-gradient(#D9D9D9)0 10px/100%50%no-repeat#4C7A6F;border-radius:50%50%0 0/32q",
    );

    expect(withBorder).toEqual(expect.arrayContaining(["nested template", "border", "conic"]));
    expect(withMargin).toEqual(expect.arrayContaining(["nested template", "border-radius", "conic"]));
  });

  it("keeps a root rule that only paints backgrounds (and css vars) as background only", () => {
    const labels = labelsFor(
      "<style>&{--c:#0000 5ch,#463C1D 0 53q,#0000;background:radial-gradient(1q at 100%,var(--c))196q -53q",
    );

    expect(labels).toContain("background only");
  });
});
