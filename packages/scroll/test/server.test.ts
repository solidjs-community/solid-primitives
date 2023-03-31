import { describe, expect, it } from "vitest";
import { createScrollPosition, getScrollPosition } from "../src/index";

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
