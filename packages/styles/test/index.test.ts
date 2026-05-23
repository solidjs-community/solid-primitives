import { describe, it, expect, beforeEach } from "vitest";
import { createRoot, flush } from "solid-js";
import { getRemSize, createRemSize, useRemSize } from "../src/index.js";

// Controllable ResizeObserver mock
let triggerResize: () => void = () => {};
let disconnected = false;

class MockResizeObserver {
  private cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe() {
    triggerResize = () => this.cb([], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {
    disconnected = true;
    triggerResize = () => {};
  }
}
global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Controllable font-size for getComputedStyle
let mockFontSize = 16;
const origGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = (el: Element, pseudoElt?: string | null) => {
  if (el === document.documentElement) {
    return { fontSize: `${mockFontSize}px` } as CSSStyleDeclaration;
  }
  return origGetComputedStyle(el, pseudoElt ?? undefined);
};

beforeEach(() => {
  mockFontSize = 16;
  disconnected = false;
  triggerResize = () => {};
});

describe("getRemSize", () => {
  it("returns the current rem size", () => {
    expect(getRemSize()).toBe(16);
  });

  it("reflects changes to the root font size", () => {
    mockFontSize = 20;
    expect(getRemSize()).toBe(20);
  });
});

describe("createRemSize", () => {
  it("returns an accessor with the initial rem size", () => {
    const [remSize, dispose] = createRoot(dispose => [createRemSize(), dispose] as const);
    expect(remSize()).toBe(16);
    dispose();
  });

  it("updates the signal after ResizeObserver fires", () => {
    // Return signal + dispose outside createRoot so triggerResize() is called
    // outside any owned scope, matching how the browser fires it asynchronously.
    const [remSize, dispose] = createRoot(dispose => [createRemSize(), dispose] as const);

    expect(remSize()).toBe(16);

    // First ResizeObserver fire is skipped (init guard)
    triggerResize();
    flush();
    expect(remSize()).toBe(16);

    // Subsequent fires update the signal
    mockFontSize = 20;
    triggerResize();
    flush();
    expect(remSize()).toBe(20);

    dispose();
  });

  it("disconnects the ResizeObserver on cleanup", () => {
    disconnected = false;
    // Immediately dispose the inner root to trigger onCleanup
    createRoot(innerDispose => {
      createRemSize();
      return innerDispose;
    })();
    expect(disconnected).toBe(true);
  });
});

describe("useRemSize", () => {
  it("returns an accessor with the current rem size", () => {
    const [remSize, dispose] = createRoot(dispose => [useRemSize(), dispose] as const);
    expect(typeof remSize()).toBe("number");
    dispose();
  });

  it("returns the same signal for multiple callers", () => {
    const [a, b, dispose] = createRoot(
      dispose => [useRemSize(), useRemSize(), dispose] as const,
    );
    expect(a).toBe(b);
    dispose();
  });
});
