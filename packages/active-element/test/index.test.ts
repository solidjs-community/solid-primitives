import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { makeActiveElementListener, createActiveElement, focus } from "../src/index.js";

const dispatchFocusEvent = (
  target: Element | Window = window,
  event: "focus" | "blur" = "focus",
) => {
  target.dispatchEvent(new FocusEvent(event));
};

describe("makeActiveElementListener", () => {
  test("works properly", () =>
    createRoot(dispose => {
      let events = 0;
      let captured;
      makeActiveElementListener(e => ((captured = e), events++));
      expect(captured).toBe(undefined);
      dispatchFocusEvent();
      expect(captured).toBe(null);
      expect(events).toBe(1);

      dispose();
      dispatchFocusEvent();
      expect(events).toBe(1);

      const clear = makeActiveElementListener(_e => events++);
      dispatchFocusEvent();
      expect(events).toBe(2);

      clear();
      dispatchFocusEvent();
      expect(events).toBe(2);
    }));
});

describe("createActiveElement", () => {
  test("works properly", () =>
    createRoot(dispose => {
      const activeEl = createActiveElement();
      expect(activeEl()).toBe(null);
      dispose();
    }));
});

describe("use:focus", () => {
  test("works properly", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      let captured!: boolean;
      focus(el, () => e => (captured = e));
      expect(captured).toBe(false);
      dispatchFocusEvent(el, "focus");
      expect(captured).toBe(true);
      dispatchFocusEvent(el, "blur");
      expect(captured).toBe(false);
      dispose();
      dispatchFocusEvent(el, "focus");
      expect(captured).toBe(false);
    }));
});
