import { createRoot, flush } from "solid-js";
import { describe, test, expect } from "vitest";
import {
  createKeyHold,
  createShortcut,
  useKeyDownEvent,
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
      const keys = useKeyDownList();
      expect(keys()).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(keys()).toEqual(["A"]);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(keys()).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(keys()).toEqual(["ALT", "Q"]);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(keys()).toEqual([]);

      dispose();
    }));

  test("useKeyDownEvent tracks the last keydown event", () =>
    createRoot(dispose => {
      const event = useKeyDownEvent();

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(event()).instanceOf(Event);
      expect(event()!.key).toBe("a");

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(event()!.key).toBe("Alt");

      dispatchKeyEvent("Alt", "keyup");
      dispatchKeyEvent("a", "keyup");
      flush();
      expect(event()!.key).toBe("Alt");

      dispose();
    }));
});

describe("useCurrentlyHeldKey", () => {
  test("returns currently held key", () =>
    createRoot(dispose => {
      const key = useCurrentlyHeldKey();
      expect(key()).toBe(null);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(key()).toBe("A");

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(key()).toBe(null);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(key()).toBe("ALT");
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(key()).toBe(null);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      expect(key()).toBe(null);
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(key()).toBe(null);

      dispose();
    }));
});

describe("useKeyDownSequence", () => {
  test("returns sequence of pressing currently held keys", () =>
    createRoot(dispose => {
      const sequence = useKeyDownSequence();
      expect(sequence()).toEqual([]);

      dispatchKeyEvent("a", "keydown");
      flush();
      expect(sequence()).toEqual([["A"]]);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(sequence()).toEqual([]);

      dispatchKeyEvent("Alt", "keydown");
      flush();
      expect(sequence()).toEqual([["ALT"]]);
      dispatchKeyEvent("q", "keydown");
      flush();
      expect(sequence()).toEqual([["ALT"], ["ALT", "Q"]]);

      dispatchKeyEvent("Alt", "keyup");
      flush();
      expect(sequence()).toEqual([["ALT"], ["ALT", "Q"], ["Q"]]);
      dispatchKeyEvent("q", "keyup");
      flush();
      expect(sequence()).toEqual([]);

      dispose();
    }));
});

describe("createKeyHold", () => {
  test("returns a boolean of is the wanted key pressed", () =>
    createRoot(dispose => {
      const isHeld = createKeyHold("ALT");
      expect(isHeld()).toBe(false);

      dispatchKeyEvent("ALT", "keydown");
      flush();
      expect(isHeld()).toBe(true);

      dispatchKeyEvent("a", "keyup");
      flush();
      expect(isHeld()).toBe(false);

      dispose();
    }));
});

describe("createShortcut", () => {
  test("fires callback when shortcut keys are pressed", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "Shift", "A"], () => fired++);

      dispatchKeyEvent("Control", "keydown");
      dispatchKeyEvent("Shift", "keydown");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(1);

      dispatchKeyEvent("a", "keyup");
      dispatchKeyEvent("Shift", "keyup");
      dispatchKeyEvent("Control", "keyup");

      dispose();
    }));

  test("does not fire for partial key combinations", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "A"], () => fired++);

      dispatchKeyEvent("Control", "keydown");
      expect(fired).toBe(0);

      dispatchKeyEvent("Control", "keyup");

      dispose();
    }));

  test("requireReset — fires only once until keys are released", () =>
    createRoot(dispose => {
      let fired = 0;
      createShortcut(["Control", "A"], () => fired++, { requireReset: false });

      dispatchKeyEvent("Control", "keydown");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(1);

      dispatchKeyEvent("a", "keyup");
      dispatchKeyEvent("a", "keydown");
      expect(fired).toBe(2);

      dispatchKeyEvent("Control", "keyup");
      dispatchKeyEvent("a", "keyup");

      dispose();
    }));
});
