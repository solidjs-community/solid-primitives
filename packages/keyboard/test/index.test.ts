import { createComputed, createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import {
  createKeyHold,
  useKeyDownList,
  useCurrentlyHeldKey,
  useKeyDownSequence,
} from "../src/index.js";

const dispatchKeyEvent = (key: string, type: "keydown" | "keyup") => {
  let ev = new Event(type) as any;
  ev.key = key;
  window.dispatchEvent(ev);
};

describe("useKeyDownList", () => {
  test("returns a list of currently held keys", () =>
    createRoot(dispose => {
      let captured: any;
      const [keys] = useKeyDownList();
      createComputed(() => (captured = keys()));
      expect(captured).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toEqual(["A"]);

      dispatchKeyEvent("a", "keyup");
      expect(captured).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      dispatchKeyEvent("q", "keydown");
      expect(captured).toEqual(["ALT", "Q"]);

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("q", "keyup");
      expect(captured).toEqual([]);

      dispose();
    }));

  test("returns a last keydown event", () =>
    createRoot(dispose => {
      let captured: any;
      const [, { event }] = useKeyDownList();
      createComputed(() => (captured = event()));

      dispatchKeyEvent("a", "keydown");
      expect(captured).instanceOf(Event);
      expect(captured.key).toBe("a");

      dispatchKeyEvent("Alt", "keydown");
      expect(captured.key).toBe("Alt");

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("a", "keyup");
      expect(captured.key).toBe("Alt");

      dispose();
    }));
});

describe("useCurrentlyHeldKey", () => {
  test("returns currently held key", () =>
    createRoot(dispose => {
      let captured: any;
      const key = useCurrentlyHeldKey();
      createComputed(() => (captured = key()));
      expect(captured).toBe(null);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toBe("A");

      dispatchKeyEvent("a", "keyup");
      expect(captured).toBe(null);

      dispatchKeyEvent("Alt", "keydown");
      expect(captured).toBe("ALT");
      dispatchKeyEvent("q", "keydown");
      expect(captured).toBe(null);

      dispatchKeyEvent("Alt", "keyup");
      expect(captured).toBe(null);
      dispatchKeyEvent("q", "keyup");
      expect(captured).toBe(null);

      dispose();
    }));
});

describe("useKeyDownSequence", () => {
  test("returns sequence of pressing currently held keys", () =>
    createRoot(dispose => {
      let captured: any;
      const sequence = useKeyDownSequence();
      createComputed(() => (captured = sequence()));
      expect(captured).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      expect(captured).toEqual([["A"]]);

      dispatchKeyEvent("a", "keyup");
      expect(captured).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      expect(captured).toEqual([["ALT"]]);
      dispatchKeyEvent("q", "keydown");
      expect(captured).toEqual([["ALT"], ["ALT", "Q"]]);

      dispatchKeyEvent("Alt", "keyup");
      expect(captured).toEqual([["ALT"], ["ALT", "Q"], ["Q"]]);
      dispatchKeyEvent("q", "keyup");
      expect(captured).toEqual([]);

      dispose();
    }));
});

describe("createKeyHold", () => {
  test("returns a boolean of is the wanted key pressed", () =>
    createRoot(dispose => {
      let captured: any;
      const isHeld = createKeyHold("ALT");
      createComputed(() => (captured = isHeld()));
      expect(captured).toBe(false);

      dispatchKeyEvent("ALT", "keydown");

      expect(captured).toBe(true);

      dispatchKeyEvent("a", "keyup");
      expect(captured).toEqual(false);

      dispose();
    }));
});
