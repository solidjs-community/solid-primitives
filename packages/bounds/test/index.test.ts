import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createElementBounds, getElementBounds } from "../src/index.js";

class TestResizeObserver {
  constructor() {}
  observe(target: Element, options?: ResizeObserverOptions): void {}
  unobserve(target: Element): void {}
  disconnect() {}
}
global.ResizeObserver = TestResizeObserver;

const div = document.createElement("div");

describe("getElementBounds", () => {
  test("getElementBounds", () => {
    expect(getElementBounds(div)).toEqual({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    });
  });
});

describe("createElementBounds", () => {
  test("returns bounds of element", () =>
    createRoot(dispose => {
      const bounds = createElementBounds(div);
      expect(bounds).toEqual({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 0,
        height: 0,
      });
      dispose();
    }));

  test("returns null if there is no initial element", () =>
    createRoot(dispose => {
      const bounds = createElementBounds(() => undefined);
      expect(bounds).toEqual({
        top: null,
        left: null,
        bottom: null,
        right: null,
        width: null,
        height: null,
      });
      dispose();
    }));
});
