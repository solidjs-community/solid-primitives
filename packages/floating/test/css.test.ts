import { describe, expect, test } from "vitest";
import { applySizeCssVars, computePositionFromRects, getSizeCssVars } from "../src/index.js";
import { rect } from "./helpers.js";

describe("size css vars", () => {
  const { middlewareData } = computePositionFromRects(
    rect(400, 300, 100, 40),
    { width: 60, height: 30 },
    rect(0, 0, 1000, 800),
    { placement: "bottom" },
  );

  test("getSizeCssVars", () => {
    expect(getSizeCssVars(middlewareData)).toEqual({
      "--available-width": "580px",
      "--available-height": "460px",
      "--transform-origin": "30px 0px",
    });
  });

  test("applySizeCssVars writes inline custom properties", () => {
    const el = document.createElement("div");
    applySizeCssVars(el, middlewareData);
    expect(el.style.getPropertyValue("--available-height")).toBe("460px");
    expect(el.style.getPropertyValue("--available-width")).toBe("580px");
    expect(el.style.getPropertyValue("--transform-origin")).toBe("30px 0px");
  });
});
