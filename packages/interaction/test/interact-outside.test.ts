import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  createInteractOutside,
  type CreateInteractOutsideProps,
} from "../src/index.js";

// ─── PointerEvent polyfill (jsdom does not include it) ────────────────────────

beforeAll(() => {
  if (!("PointerEvent" in window)) {
    class MockPointerEvent extends MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? "mouse";
      }
    }
    (global as unknown as Record<string, unknown>)["PointerEvent"] = MockPointerEvent;
  }
});

// ─── Test helpers ─────────────────────────────────────────────────────────────

type ElementKind = "div" | "svg";

function createElement(kind: ElementKind, testId: string): Element {
  if (kind === "svg") {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    el.setAttribute("data-testid", testId);
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "img");
    return el;
  }
  const el = document.createElement("div");
  el.setAttribute("data-testid", testId);
  el.tabIndex = 0;
  return el;
}

function setupTest(
  insideKind: ElementKind,
  outsideKind: ElementKind,
  extraProps: Partial<CreateInteractOutsideProps> = {},
) {
  const onFocusOutside = vi.fn();
  const onPointerDownOutside = vi.fn();
  const onInteractOutside = vi.fn();

  const container = document.createElement("div");
  const inside = createElement(insideKind, "inside");
  const outside = createElement(outsideKind, "outside");
  container.appendChild(inside);
  container.appendChild(outside);
  document.body.appendChild(container);

  const dispose = createRoot(d => {
    createInteractOutside(
      { onFocusOutside, onPointerDownOutside, onInteractOutside, ...extraProps },
      () => inside,
    );
    return d;
  });

  flush();
  vi.runAllTimers(); // advance setTimeout for pointerdown listener registration

  return {
    mocks: { onFocusOutside, onPointerDownOutside, onInteractOutside },
    inside,
    outside,
    cleanup: () => {
      dispose();
      document.body.removeChild(container);
    },
  };
}

// ─── Test configurations ──────────────────────────────────────────────────────

const testConfigurations: { name: string; inside: ElementKind; outside: ElementKind }[] = [
  { name: "HTML ref with HTML outside", inside: "div", outside: "div" },
  { name: "SVG ref with HTML outside", inside: "svg", outside: "div" },
  { name: "HTML ref with SVG outside", inside: "div", outside: "svg" },
  { name: "SVG ref with SVG outside", inside: "svg", outside: "svg" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createInteractOutside", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe.each(testConfigurations)("$name", ({ inside: insideKind, outside: outsideKind }) => {
    describe("Focus Events", () => {
      it("triggers onFocusOutside and onInteractOutside when focusing outside", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind);
        outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(mocks.onFocusOutside).toHaveBeenCalledTimes(1);
        expect(mocks.onPointerDownOutside).not.toHaveBeenCalled();
        expect(mocks.onInteractOutside).toHaveBeenCalledTimes(1);
        cleanup();
      });

      it("does not trigger when focusing inside", () => {
        const { mocks, inside, cleanup } = setupTest(insideKind, outsideKind);
        inside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(mocks.onFocusOutside).not.toHaveBeenCalled();
        expect(mocks.onPointerDownOutside).not.toHaveBeenCalled();
        expect(mocks.onInteractOutside).not.toHaveBeenCalled();
        cleanup();
      });

      it("passes the original FocusEvent in event detail", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind);
        const focusEvent = new FocusEvent("focusin", { bubbles: true });
        outside.dispatchEvent(focusEvent);
        const receivedEvent = mocks.onFocusOutside.mock.calls[0]![0];
        expect(receivedEvent.detail.originalEvent).toBe(focusEvent);
        expect(receivedEvent.detail.isContextMenu).toBe(false);
        cleanup();
      });

      it("stops calling onInteractOutside when onFocusOutside calls preventDefault", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind, {
          onFocusOutside: e => e.preventDefault(),
        });
        outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(mocks.onInteractOutside).not.toHaveBeenCalled();
        cleanup();
      });
    });

    describe("Pointer Events", () => {
      it("triggers onPointerDownOutside and onInteractOutside when clicking outside", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind);
        outside.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
        );
        expect(mocks.onFocusOutside).not.toHaveBeenCalled();
        expect(mocks.onPointerDownOutside).toHaveBeenCalledTimes(1);
        expect(mocks.onInteractOutside).toHaveBeenCalledTimes(1);
        cleanup();
      });

      it("does not trigger when clicking inside", () => {
        const { mocks, inside, cleanup } = setupTest(insideKind, outsideKind);
        inside.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
        );
        expect(mocks.onFocusOutside).not.toHaveBeenCalled();
        expect(mocks.onPointerDownOutside).not.toHaveBeenCalled();
        expect(mocks.onInteractOutside).not.toHaveBeenCalled();
        cleanup();
      });

      it("passes the original PointerEvent in event detail", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind);
        const pointerEvent = new PointerEvent("pointerdown", {
          bubbles: true,
          pointerType: "mouse",
        });
        outside.dispatchEvent(pointerEvent);
        const receivedEvent = mocks.onPointerDownOutside.mock.calls[0]![0];
        expect(receivedEvent.detail.originalEvent).toBe(pointerEvent);
        cleanup();
      });

      it("stops calling onInteractOutside when onPointerDownOutside calls preventDefault", () => {
        const { mocks, outside, cleanup } = setupTest(insideKind, outsideKind, {
          onPointerDownOutside: e => e.preventDefault(),
        });
        outside.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
        );
        expect(mocks.onInteractOutside).not.toHaveBeenCalled();
        cleanup();
      });
    });
  });

  describe("Configuration", () => {
    it("does not trigger when isDisabled is true", () => {
      const { mocks, outside, cleanup } = setupTest("div", "div", { isDisabled: true });
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onFocusOutside).not.toHaveBeenCalled();
      expect(mocks.onPointerDownOutside).not.toHaveBeenCalled();
      expect(mocks.onInteractOutside).not.toHaveBeenCalled();
      cleanup();
    });

    it("does not trigger when isDisabled accessor returns true", () => {
      const { mocks, outside, cleanup } = setupTest("div", "div", { isDisabled: () => true });
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onFocusOutside).not.toHaveBeenCalled();
      cleanup();
    });

    it("does not trigger when shouldExcludeElement returns true for the target", () => {
      let excluded: Element | null = null;
      const { mocks, outside, cleanup } = setupTest("div", "div", {
        shouldExcludeElement: el => el === excluded,
      });
      excluded = outside;
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onInteractOutside).not.toHaveBeenCalled();
      cleanup();
    });

    it("triggers when shouldExcludeElement returns false", () => {
      const shouldExcludeElement = vi.fn(() => false);
      const { mocks, outside, cleanup } = setupTest("div", "div", { shouldExcludeElement });
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(shouldExcludeElement).toHaveBeenCalledWith(outside);
      expect(mocks.onInteractOutside).toHaveBeenCalledTimes(1);
      cleanup();
    });

    it("re-enables listeners when isDisabled changes from true to false", () => {
      // Must use a Solid signal so the effect reacts to the change.
      const [isDisabled, setIsDisabled] = createSignal(true);
      const { mocks, outside, cleanup } = setupTest("div", "div", { isDisabled });

      // Disabled — should not trigger
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onFocusOutside).not.toHaveBeenCalled();

      // Enable and flush to re-register listeners
      setIsDisabled(false);
      flush();
      vi.runAllTimers();

      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onFocusOutside).toHaveBeenCalledTimes(1);
      cleanup();
    });

    it("cleans up listeners when reactive root is disposed", () => {
      const { mocks, outside, cleanup } = setupTest("div", "div");
      cleanup();
      outside.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(mocks.onFocusOutside).not.toHaveBeenCalled();
    });
  });
});
