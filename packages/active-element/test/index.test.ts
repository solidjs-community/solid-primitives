import { fireEvent, createEvent } from "solid-testing-library";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import {
  makeActiveElementListener,
  createActiveElement,
  makeFocusListener,
  createFocusSignal,
  focus
} from "../src";

const dispatchFocusEvent = (target: Element | Window = window, event: "focus" | "blur" = "focus") =>
  fireEvent(target, createEvent(event, window));

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

      const clear = makeActiveElementListener(e => events++);
      dispatchFocusEvent();
      expect(events).toBe(2);

      clear();
      dispatchFocusEvent();
      expect(events).toBe(2);
    }));
});

describe("makeFocusListener", () => {
  test("works properly", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      const captured: any[] = [];
      const clear = makeFocusListener(el, e => captured.push(e));
      expect(captured).toEqual([]);
      dispatchFocusEvent(el, "focus");
      expect(captured).toEqual([true]);
      dispatchFocusEvent(el, "blur");
      expect(captured).toEqual([true, false]);
      clear();
      dispatchFocusEvent(el, "focus");
      expect(captured).toEqual([true, false]);
      makeFocusListener(el, e => captured.push(e));
      dispatchFocusEvent(el, "blur");
      expect(captured).toEqual([true, false, false]);
      dispose();
      dispatchFocusEvent(el, "focus");
      expect(captured).toEqual([true, false, false]);
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

describe("createFocusSignal", () => {
  test("works properly", () =>
    createRoot(dispose => {
      const el = document.createElement("div");
      const activeEl = createFocusSignal(el);
      expect(activeEl()).toBe(false);
      dispatchFocusEvent(el, "focus");
      expect(activeEl()).toBe(true);
      dispatchFocusEvent(el, "blur");
      expect(activeEl()).toBe(false);
      dispose();
      dispatchFocusEvent(el, "focus");
      expect(activeEl()).toBe(false);
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
