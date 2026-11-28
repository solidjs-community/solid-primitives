import { describe, expect, it, vi } from "vitest";
import {
  createDismissableLayer,
  getLayerStack,
  getTopLayer,
  isTopLayer,
  makeDismissableLayer,
  useLayerStack,
} from "../src/index.js";

describe("dismissable on the server", () => {
  it("makeDismissableLayer returns inert controls", () => {
    const onDismiss = vi.fn();
    const controls = makeDismissableLayer({ element: {} as Element, onDismiss });
    expect(() => controls.dismiss()).not.toThrow();
    expect(() => controls.cleanup()).not.toThrow();
    expect(onDismiss).not.toHaveBeenCalled();
    expect(getLayerStack()).toEqual([]);
  });

  it("createDismissableLayer is a no-op", () => {
    const ctl = createDismissableLayer({ ref: () => undefined, onDismiss: () => {} });
    expect(ctl.isTop()).toBe(false);
    expect(() => ctl.dismiss("escape")).not.toThrow();
  });

  it("stack helpers return empty results", () => {
    const controls = makeDismissableLayer({ element: {} as Element, onDismiss: () => {} });
    expect(getTopLayer()).toBeUndefined();
    expect(isTopLayer(controls.layer)).toBe(false);
    expect(useLayerStack()()).toEqual([]);
  });
});
