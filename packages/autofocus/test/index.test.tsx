import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { autofocus, createAutofocus } from "../src/index.js";

let focused: HTMLElement | null = null;

const original_focus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = function (this) {
  focused = this;
};

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
  focused = null;
});

afterAll(() => {
  vi.useRealTimers();
  HTMLElement.prototype.focus = original_focus;
});

describe("autofocus", () => {
  test("focuses the element with autofocus attribute", () => {
    const el = document.createElement("button");
    el.setAttribute("autofocus", "");

    const dispose = createRoot(dispose => {
      // Phase 1: factory registers onSettled
      const ref = autofocus();
      // Phase 2: ref callback receives the element
      ref(el);
      return dispose;
    });

    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(el);

    dispose();
  });

  test("doesn't focus when autofocus HTML attribute is absent", () => {
    const el = document.createElement("button");

    const dispose = createRoot(dispose => {
      const ref = autofocus();
      ref(el);
      return dispose;
    });

    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(null);

    dispose();
  });

  test("doesn't focus when enabled is false", () => {
    const el = document.createElement("button");
    el.setAttribute("autofocus", "");

    const dispose = createRoot(dispose => {
      const ref = autofocus(false);
      ref(el);
      return dispose;
    });

    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(null);

    dispose();
  });
});

describe("createAutofocus", () => {
  const el = document.createElement("button"),
    el2 = document.createElement("button");

  test("createAutofocus focuses the element", () => {
    const dispose = createRoot(dispose => {
      createAutofocus(() => el);
      return dispose;
    });

    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(el);

    dispose();
  });

  test("createAutofocus works with signal", () => {
    const [ref, setRef] = createSignal<HTMLButtonElement>();

    const dispose = createRoot(dispose => {
      createAutofocus(ref);
      return dispose;
    });

    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(null);

    setRef(el);
    flush();
    expect(focused).toBe(null);
    vi.runAllTimers();
    expect(focused).toBe(el);

    setRef(el2);
    flush();
    expect(focused).toBe(el);
    vi.runAllTimers();
    expect(focused).toBe(el2);

    dispose();

    setRef(el);
    expect(focused).toBe(el2);
    vi.runAllTimers();
    expect(focused).toBe(el2);
  });
});
