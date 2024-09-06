import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { autofocus, createAutofocus } from "../src/index.js";

autofocus;

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

describe("use:autofocus", () => {
  test("use:autofocus focuses the element", () => {
    const result = createRoot(dispose => ({
      dispose,
      el: (
        <button use:autofocus autofocus>
          Autofocused
        </button>
      ) as HTMLButtonElement,
    }));

    expect(focused).toBe(null);

    vi.runAllTimers();
    expect(focused).toBe(result.el);

    result.dispose();
  });

  test("use:autofocus doesn't focus when autofocus={false}", () => {
    const result = createRoot(dispose => ({
      dispose,
      el: (
        <button use:autofocus autofocus={false}>
          Autofocused
        </button>
      ) as HTMLButtonElement,
    }));

    expect(focused).toBe(null);

    vi.runAllTimers();
    expect(focused).toBe(null);

    result.dispose();
  });

  test("doesn't focus with use:autofocus={false}", async () => {
    const result = createRoot(dispose => ({
      dispose,
      el: (
        <button use:autofocus={false} autofocus>
          Autofocused
        </button>
      ) as HTMLButtonElement,
    }));

    expect(focused).toBe(null);

    vi.runAllTimers();
    expect(focused).toBe(null);

    result.dispose();
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

    expect(focused).toBe(null);

    vi.runAllTimers();
    expect(focused).toBe(null);

    setRef(el);
    expect(focused).toBe(null);

    vi.runAllTimers();
    expect(focused).toBe(el);

    setRef(el2);
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
