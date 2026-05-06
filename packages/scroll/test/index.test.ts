import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";

import { createScrollPosition, getScrollPosition } from "../src/index.js";

describe("getScrollPosition", () => {
  it("no target returns null", () => {
    expect(getScrollPosition(undefined)).toEqual({ x: 0, y: 0 });
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
      const target = document.createElement("div");
      const scroll = createScrollPosition(target);

      expect(scroll.x).toBe(0);
      expect(scroll.y).toBe(0);

      Object.assign(target, { scrollTop: 34, scrollLeft: 100 });
      target.dispatchEvent(new Event("scroll"));
      flush();

      expect(scroll.x).toBe(100);
      expect(scroll.y).toBe(34);

      Object.assign(target, { scrollTop: 11, scrollLeft: 42 });
      target.dispatchEvent(new Event("scroll"));
      flush();

      expect(scroll.x).toBe(42);
      expect(scroll.y).toBe(11);

      dispose();
    }));

  it("target is reactive", () =>
    createRoot(dispose => {
      const div1 = document.createElement("div");
      Object.assign(div1, { scrollTop: 34, scrollLeft: 100 });

      const div2 = document.createElement("div");
      Object.assign(div2, { scrollTop: 11, scrollLeft: 42 });

      const [target, setTarget] = createSignal<Element | undefined>(div1, { ownedWrite: true });

      const scroll = createScrollPosition(target);
      expect(scroll).toEqual({ x: 100, y: 34 });

      setTarget(div2);
      flush();
      expect(scroll).toEqual({ x: 42, y: 11 });

      setTarget();
      flush();
      expect(scroll).toEqual({ x: 0, y: 0 });

      dispose();
    }));
});
