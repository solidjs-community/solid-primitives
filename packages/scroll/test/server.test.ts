import { describe, expect, it } from "vitest";
import { createScrollPosition, getScrollPosition, useWindowScrollPosition } from "../src/index.js";

describe("getScrollPosition", () => {
  it("returns null", () => {
    expect(getScrollPosition(undefined)).toEqual({ x: 0, y: 0 });
  });
});

describe("createScrollPosition", () => {
  it("returns null", () => {
    expect(createScrollPosition()).toEqual({ x: 0, y: 0 });
  });
});

describe("useWindowScrollPosition", () => {
  it("returns null", () => {
    expect(useWindowScrollPosition()).toEqual({ x: 0, y: 0 });
  });
});
