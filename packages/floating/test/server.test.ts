import { describe, expect, test, vi } from "vitest";
import { createRoot } from "solid-js";
import {
  applySizeCssVars,
  computePositionFromRects,
  createFloating,
  makeAutoUpdate,
} from "../src/index.js";

describe("floating — SSR", () => {
  test("computePositionFromRects is pure and works without a DOM", () => {
    const r = computePositionFromRects(
      { x: 400, y: 300, width: 100, height: 40 },
      { width: 60, height: 30 },
      { x: 0, y: 0, width: 1000, height: 800 },
      { placement: "top-start", flip: true, shift: true },
    );
    expect([r.x, r.y, r.placement]).toEqual([400, 270, "top-start"]);
  });

  test("createFloating renders stable unpositioned styles", () => {
    createRoot(dispose => {
      const f = createFloating({
        reference: () => null,
        floating: () => null,
        placement: "top",
        strategy: "fixed",
        autoUpdate: true,
      });
      expect(f.isPositioned()).toBe(false);
      expect([f.x(), f.y(), f.placement(), f.strategy()]).toEqual([0, 0, "top", "fixed"]);
      expect(f.styles()).toEqual({ position: "fixed", top: "0", left: "0" });
      expect(f.middlewareData()).toBeUndefined();
      expect(() => f.update()).not.toThrow();
      dispose();
    });
  });

  test("createFloating never measures on the server", () => {
    const getBoundingClientRect = vi.fn();
    createRoot(dispose => {
      const el = { getBoundingClientRect } as unknown as HTMLElement;
      const whileElementsMounted = vi.fn();
      const f = createFloating({ reference: el, floating: el, whileElementsMounted });
      f.update();
      expect(f.isPositioned()).toBe(false);
      expect(getBoundingClientRect).not.toHaveBeenCalled();
      dispose();
    });
  });

  test("makeAutoUpdate is a no-op without a window", () => {
    const update = vi.fn();
    const stop = makeAutoUpdate({} as Element, {} as HTMLElement, update);
    expect(() => stop()).not.toThrow();
    expect(update).not.toHaveBeenCalled();
  });

  test("css var helpers are safe to import", () => {
    expect(typeof applySizeCssVars).toBe("function");
  });
});
