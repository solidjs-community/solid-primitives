import { describe, expect, it } from "vitest";
import { createMousePosition, createPositionToElement } from "../src/index.js";

describe("createMousePosition", () => {
  it("returns fallback on the server", () => {
    const pos = createMousePosition();
    expect(pos).toEqual({ x: 0, y: 0, sourceType: null, isInside: false });
  });

  it("respects initialValue on the server", () => {
    const pos = createMousePosition(undefined, { initialValue: { x: 10, y: 20 } });
    expect(pos).toEqual({ x: 10, y: 20, sourceType: null, isInside: false });
  });
});

describe("createPositionToElement", () => {
  it("returns fallback on the server", () => {
    const pos = createPositionToElement(
      () => undefined,
      () => ({ x: 0, y: 0 }),
    );
    expect(pos).toEqual({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0, isInside: true });
  });

  it("respects initialValue on the server", () => {
    const pos = createPositionToElement(
      () => undefined,
      () => ({ x: 0, y: 0 }),
      { initialValue: { x: 5, y: 10, top: 1, left: 2, width: 100, height: 200 } },
    );
    expect(pos).toEqual({ x: 5, y: 10, top: 1, left: 2, width: 100, height: 200, isInside: true });
  });
});
