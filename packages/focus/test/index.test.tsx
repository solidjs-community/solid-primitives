import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { autofocus, createAutofocus, createFocusTrap } from "../src/index.js";

// ─── Shared focus tracking ────────────────────────────────────────────────────

let focused: HTMLElement | null = null;

const original_focus = HTMLElement.prototype.focus;
HTMLElement.prototype.focus = function (this: HTMLElement) {
  focused = this;
};

// ─── Fake timers + rAF stub ───────────────────────────────────────────────────

beforeAll(() => {
  vi.useFakeTimers();
  // afterPaint uses double rAF; stub it as setTimeout so vi.runAllTimers() drives it.
  vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) =>
    setTimeout(() => fn(performance.now()), 0),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

beforeEach(() => {
  vi.clearAllTimers();
  focused = null;
});

afterAll(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  HTMLElement.prototype.focus = original_focus;
});

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Run all pending effects then drain all timers (including nested rAFs). */
const settle = () => {
  flush();
  vi.runAllTimers();
};

// ─── autofocus ────────────────────────────────────────────────────────────────

describe("autofocus", () => {
  test("focuses the element with autofocus attribute", () => {
    const el = document.createElement("button");
    el.setAttribute("autofocus", "");

    const dispose = createRoot(dispose => {
      const ref = autofocus();
      ref(el);
      return dispose;
    });

    settle();
    expect(focused).toBe(el);
    dispose();
  });

  test("doesn't focus when autofocus attribute is absent", () => {
    const el = document.createElement("button");

    const dispose = createRoot(dispose => {
      const ref = autofocus();
      ref(el);
      return dispose;
    });

    settle();
    expect(focused).toBe(null);
    dispose();
  });
});

// ─── createAutofocus ──────────────────────────────────────────────────────────

describe("createAutofocus", () => {
  const el = document.createElement("button"),
    el2 = document.createElement("button");

  test("focuses the element", () => {
    const dispose = createRoot(dispose => {
      createAutofocus(() => el);
      return dispose;
    });

    settle();
    expect(focused).toBe(el);
    dispose();
  });

  test("works with signal — focuses when signal is set", () => {
    const [ref, setRef] = createSignal<HTMLButtonElement>();

    const dispose = createRoot(dispose => {
      createAutofocus(ref);
      return dispose;
    });

    settle();
    expect(focused).toBe(null);

    setRef(el);
    settle();
    expect(focused).toBe(el);

    setRef(el2);
    settle();
    expect(focused).toBe(el2);

    dispose();

    setRef(el);
    vi.runAllTimers();
    expect(focused).toBe(el2); // no focus after dispose
  });
});

// ─── createFocusTrap ──────────────────────────────────────────────────────────

/** Build a container with `n` focusable buttons and return them. */
function makeContainer(n: number): { container: HTMLElement; buttons: HTMLButtonElement[] } {
  const container = document.createElement("div");
  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < n; i++) {
    const btn = document.createElement("button");
    btn.textContent = `btn${i}`;
    container.appendChild(btn);
    buttons.push(btn);
  }
  return { container, buttons };
}

function tabKey(shiftKey = false) {
  return new KeyboardEvent("keydown", { key: "Tab", shiftKey, bubbles: true, cancelable: true });
}

describe("createFocusTrap", () => {
  test("focuses the first focusable element on activation", () => {
    const { container, buttons } = makeContainer(3);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container });
      return dispose;
    });

    settle();
    expect(focused).toBe(buttons[0]);
    dispose();
  });

  test("Tab on last element wraps to first", () => {
    const { container, buttons } = makeContainer(3);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container });
      return dispose;
    });

    settle();
    buttons[2]!.dispatchEvent(tabKey(false));
    expect(focused).toBe(buttons[0]);
    dispose();
  });

  test("Shift+Tab on first element wraps to last", () => {
    const { container, buttons } = makeContainer(3);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container });
      return dispose;
    });

    settle();
    buttons[0]!.dispatchEvent(tabKey(true));
    expect(focused).toBe(buttons[2]);
    dispose();
  });

  test("blocks Tab when there are no focusable elements", () => {
    const container = document.createElement("div"); // no children

    let tabPrevented = false;
    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container });
      return dispose;
    });

    flush(); // run effects so preventTab listener is added

    const event = tabKey();
    Object.defineProperty(event, "defaultPrevented", { get: () => tabPrevented });
    const originalPreventDefault = event.preventDefault.bind(event);
    event.preventDefault = () => {
      tabPrevented = true;
      originalPreventDefault();
    };

    document.dispatchEvent(event);
    expect(tabPrevented).toBe(true);
    dispose();
  });

  test("does not activate when enabled is false", () => {
    const { container } = makeContainer(2);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled: false });
      return dispose;
    });

    settle();
    expect(focused).toBe(null);
    dispose();
  });

  test("activates and deactivates reactively via enabled signal", () => {
    const { container, buttons } = makeContainer(2);
    const [enabled, setEnabled] = createSignal(false);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled });
      return dispose;
    });

    settle();
    expect(focused).toBe(null); // not yet enabled

    setEnabled(true);
    settle();
    expect(focused).toBe(buttons[0]); // initial focus

    dispose();
  });

  test("restores focus to the previously focused element on deactivation", () => {
    const { container, buttons } = makeContainer(2);
    const trigger = document.createElement("button");
    const [enabled, setEnabled] = createSignal(true);

    // Pretend `trigger` is the element that was focused before the trap.
    const origActiveElement = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement")!;
    Object.defineProperty(document, "activeElement", {
      get: () => trigger,
      configurable: true,
    });

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled });
      return dispose;
    });

    settle();
    expect(focused).toBe(buttons[0]); // initial focus inside trap

    // Restore the real activeElement descriptor before deactivating
    Object.defineProperty(document, "activeElement", origActiveElement);

    setEnabled(false);
    settle();
    expect(focused).toBe(trigger); // focus restored
    dispose();
  });

  test("uses initialFocusElement when provided", () => {
    const { container, buttons } = makeContainer(3);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, initialFocusElement: buttons[2] });
      return dispose;
    });

    settle();
    expect(focused).toBe(buttons[2]);
    dispose();
  });

  test("uses finalFocusElement when provided on deactivation", () => {
    const { container } = makeContainer(2);
    const customFinal = document.createElement("button");
    const [enabled, setEnabled] = createSignal(true);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled, finalFocusElement: customFinal });
      return dispose;
    });

    settle();

    setEnabled(false);
    settle();
    expect(focused).toBe(customFinal);
    dispose();
  });

  test("onInitialFocus callback is called when trap activates", () => {
    const { container } = makeContainer(1);
    const onInitialFocus = vi.fn();

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, onInitialFocus });
      return dispose;
    });

    settle();
    expect(onInitialFocus).toHaveBeenCalledOnce();
    dispose();
  });

  test("onInitialFocus preventDefault suppresses initial focus", () => {
    const { container } = makeContainer(1);

    const dispose = createRoot(dispose => {
      createFocusTrap({
        element: container,
        onInitialFocus: e => e.preventDefault(),
      });
      return dispose;
    });

    settle();
    expect(focused).toBe(null);
    dispose();
  });

  test("onFinalFocus callback is called on deactivation", () => {
    const { container } = makeContainer(1);
    const [enabled, setEnabled] = createSignal(true);
    const onFinalFocus = vi.fn();

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled, onFinalFocus });
      return dispose;
    });

    settle();
    setEnabled(false);
    settle();
    expect(onFinalFocus).toHaveBeenCalledOnce();
    dispose();
  });

  test("onFinalFocus preventDefault suppresses focus restore", () => {
    const { container } = makeContainer(1);
    const trigger = document.createElement("button");
    const [enabled, setEnabled] = createSignal(true);

    const origActiveElement = Object.getOwnPropertyDescriptor(Document.prototype, "activeElement")!;
    Object.defineProperty(document, "activeElement", {
      get: () => trigger,
      configurable: true,
    });

    const dispose = createRoot(dispose => {
      createFocusTrap({
        element: container,
        enabled,
        onFinalFocus: e => e.preventDefault(),
      });
      return dispose;
    });

    settle();
    Object.defineProperty(document, "activeElement", origActiveElement);

    focused = null;
    setEnabled(false);
    settle();
    expect(focused).toBe(null); // prevented
    dispose();
  });

  test("does not restore focus when restoreFocus is false", () => {
    const { container } = makeContainer(1);
    const [enabled, setEnabled] = createSignal(true);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container, enabled, restoreFocus: false });
      return dispose;
    });

    settle();
    focused = null;
    setEnabled(false);
    settle();
    expect(focused).toBe(null);
    dispose();
  });

  test("respects tabIndex ordering for focusable elements", () => {
    const container = document.createElement("div");
    const a = document.createElement("button"); // tabIndex 0
    const b = document.createElement("button");
    b.tabIndex = 2;
    const c = document.createElement("button");
    c.tabIndex = 1;
    // DOM order: a(0), b(2), c(1)  →  sorted: a(0), c(1), b(2)
    container.append(a, b, c);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: container });
      return dispose;
    });

    settle();
    expect(focused).toBe(a); // first by tabIndex order

    // Tab on last (b, tabIndex=2) wraps to first (a, tabIndex=0)
    b.dispatchEvent(tabKey(false));
    expect(focused).toBe(a);

    // Shift+Tab on first (a) wraps to last (b)
    a.dispatchEvent(tabKey(true));
    expect(focused).toBe(b);

    dispose();
  });

  test("element as reactive signal — activates when signal becomes non-null", () => {
    const { container, buttons } = makeContainer(2);
    const [el, setEl] = createSignal<HTMLElement | null>(null);

    const dispose = createRoot(dispose => {
      createFocusTrap({ element: el });
      return dispose;
    });

    settle();
    expect(focused).toBe(null);

    setEl(container);
    settle();
    expect(focused).toBe(buttons[0]);
    dispose();
  });
});
