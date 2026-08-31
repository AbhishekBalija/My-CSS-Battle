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
      expect.arrayContaining(["multi-element", "linear", "margin positioning"]),
    );
  });

  it("recognizes an all-gradient background without elements", () => {
    const labels = labelsFor(
      "<style>&{background:conic-gradient(red 25%,blue 0),radial-gradient(red,blue)}",
    );

    expect(labels).toEqual(
      expect.arrayContaining(["all gradient", "conic", "radial"]),
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
        "multi-element",
        "direct-child selector",
        "margin positioning",
        "flexbox",
      ]),
    );
  });
});
