import { describe, expect, it } from "vitest";
import {
  createScrollPosition,
  createPreventScroll,
  getScrollPosition,
  useWindowScrollPosition,
} from "../src/index.js";

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

describe("createPreventScroll", () => {
  it("does nothing on the server", () => {
    expect(() => createPreventScroll()).not.toThrow();
    expect(() => createPreventScroll({ enabled: true, hideScrollbar: true })).not.toThrow();
  });
});
