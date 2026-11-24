import { describe, expect, test, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import {
  createAnimate,
  createAnimationGroup,
  createMotionPath,
  createPresenceAnimation,
  createScrollAnimation,
  createStagger,
  createViewAnimation,
  makeSequence,
} from "../src/index.js";

describe("animation SSR", () => {
  test("reactive primitives don't break on the server", () => {
    createRoot(dispose => {
      const [el] = createSignal<HTMLElement | null>(null);
      const kf = [{ opacity: 0 }, { opacity: 1 }];
      expect(createAnimate(el, kf)()).toBeUndefined();
      expect(createScrollAnimation(el, kf)()).toBeUndefined();
      expect(createViewAnimation(el, kf)()).toBeUndefined();
      expect(createMotionPath(el, "circle(50%)")()).toBeUndefined();
      expect(createStagger(() => [], kf)()).toEqual([]);
      const group = createAnimationGroup(() => []);
      expect(() => group.play()).not.toThrow();
      const [show] = createSignal(true);
      expect(createPresenceAnimation(el, show, { enter: kf }).isMounted()).toBe(true);
      dispose();
    });
  });

  test("makeSequence can be created without playing", () => {
    expect(() => makeSequence([() => undefined])).not.toThrow();
    const f = vi.fn();
    makeSequence([f]);
    expect(f).not.toHaveBeenCalled();
  });
});
