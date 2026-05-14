import { createRoot } from "solid-js";
import { describe, it, expect } from "vitest";
import {
  useKeyDownEvent,
  useKeyDownList,
  useCurrentlyHeldKey,
  useKeyDownSequence,
  createKeyHold,
  createShortcut,
} from "../src/index.js";

describe("SSR", () => {
  it("useKeyDownEvent returns null on server", () =>
    createRoot(dispose => {
      const event = useKeyDownEvent();
      expect(event()).toBe(null);
      dispose();
    }));

  it("useKeyDownList returns empty array on server", () =>
    createRoot(dispose => {
      const keys = useKeyDownList();
      expect(keys()).toEqual([]);
      dispose();
    }));

  it("useCurrentlyHeldKey returns null on server", () =>
    createRoot(dispose => {
      const key = useCurrentlyHeldKey();
      expect(key()).toBe(null);
      dispose();
    }));

  it("useKeyDownSequence returns empty array on server", () =>
    createRoot(dispose => {
      const sequence = useKeyDownSequence();
      expect(sequence()).toEqual([]);
      dispose();
    }));

  it("createKeyHold returns false on server", () =>
    createRoot(dispose => {
      const isHeld = createKeyHold("A");
      expect(isHeld()).toBe(false);
      dispose();
    }));

  it("createShortcut does not throw on server", () =>
    createRoot(dispose => {
      expect(() => createShortcut(["A"], () => {})).not.toThrow();
      dispose();
    }));
});
