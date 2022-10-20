import { createComputed, createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { createScrollPosition, getScrollPosition } from "../src/index";

describe("getScrollPosition", () => {

  it("no target returns null", () => {
    expect(getScrollPosition(undefined)).toEqual({ x: null, y: null });
  });

  it.skip("get's scroll of window", () => {
    const target = window;
    Object.assign(target, { scrollY: 123, scrollX: 222 });
    expect(getScrollPosition(target)).toEqual({ x: 222, y: 123 });
  });

  it("get's scroll of html Element", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    Object.assign(target, { scrollTop: 123, scrollLeft: 222 });
    expect(getScrollPosition(target)).toEqual({ x: 222, y: 123 });
    document.body.removeChild(target);
  });
});

describe("createScrollPosition", () => {
  it("will observe scroll events", () =>
    createRoot(dispose => {
      const expectedX = [0, 100, 42];
      const actualX: number[] = [];
      const expectedY = [0, 34, 11];
      const actualY: number[] = [];

      const target = document.createElement("div");

      const scroll = createScrollPosition(target);

      createComputed(() => {
        actualX.push(scroll.x);
        actualY.push(scroll.y);
      });

      Object.assign(target, { scrollTop: 34, scrollLeft: 100 });
      target.dispatchEvent(new Event("scroll"));

      Object.assign(target, { scrollTop: 11, scrollLeft: 42 });
      target.dispatchEvent(new Event("scroll"));

      expect(actualX).toEqual(expectedX);
      expect(actualY).toEqual(expectedY);

      dispose();
    })
  );

  it("target is reactive", () =>
    createRoot(dispose => {
      const div1 = document.createElement("div");
      Object.assign(div1, { scrollTop: 34, scrollLeft: 100 });

      const div2 = document.createElement("div");
      Object.assign(div2, { scrollTop: 11, scrollLeft: 42 });

      const [target, setTarget] = createSignal<Element | undefined>(div1);

      const scroll = createScrollPosition(target);
      expect(scroll).toEqual({ x: 100, y: 34 });

      setTarget(div2);
      expect(scroll).toEqual({ x: 42, y: 11 });

      setTarget();
      expect(scroll).toEqual({ x: null, y: null });

      dispose();
    })
  );
});
