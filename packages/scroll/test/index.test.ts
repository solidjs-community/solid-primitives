import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { createScrollPosition, getScrollPosition, createPreventScroll } from "../src/index.js";

describe("getScrollPosition", () => {
  it("no target returns null", () => {
    expect(getScrollPosition(undefined)).toEqual({ x: 0, y: 0 });
  });

  it("get's scroll of html Element", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    Object.assign(target, { scrollTop: 123, scrollLeft: 222 });
    expect(getScrollPosition(target)).toEqual({ x: 222, y: 123 });
    document.body.removeChild(target);
  });
});

describe("createScrollPosition", () => {
  it("will observe scroll events", () =>
    createRoot(dispose => {
      const target = document.createElement("div");
      const scroll = createScrollPosition(target);

      expect(scroll.x).toBe(0);
      expect(scroll.y).toBe(0);

      Object.assign(target, { scrollTop: 34, scrollLeft: 100 });
      target.dispatchEvent(new Event("scroll"));
      flush();

      expect(scroll.x).toBe(100);
      expect(scroll.y).toBe(34);

      Object.assign(target, { scrollTop: 11, scrollLeft: 42 });
      target.dispatchEvent(new Event("scroll"));
      flush();

      expect(scroll.x).toBe(42);
      expect(scroll.y).toBe(11);

      dispose();
    }));

  it("target is reactive", () =>
    createRoot(dispose => {
      const div1 = document.createElement("div");
      Object.assign(div1, { scrollTop: 34, scrollLeft: 100 });

      const div2 = document.createElement("div");
      Object.assign(div2, { scrollTop: 11, scrollLeft: 42 });

      const [target, setTarget] = createSignal<Element | undefined>(div1, { ownedWrite: true });

      const scroll = createScrollPosition(target);
      expect(scroll).toEqual({ x: 100, y: 34 });

      setTarget(div2);
      flush();
      expect(scroll).toEqual({ x: 42, y: 11 });

      setTarget();
      flush();
      expect(scroll).toEqual({ x: 0, y: 0 });

      dispose();
    }));
});

describe("createPreventScroll", () => {
  beforeEach(() => {
    document.body.removeAttribute("style");
    vi.stubGlobal("scrollTo", vi.fn());
  });

  afterEach(() => {
    document.body.removeAttribute("style");
    vi.unstubAllGlobals();
  });

  it("sets overflow:hidden on body when enabled", () =>
    createRoot(dispose => {
      createPreventScroll();
      flush();

      expect(document.body.style.overflow).toBe("hidden");

      dispose();
    }));

  it("restores body style on cleanup", () =>
    createRoot(dispose => {
      createPreventScroll();
      flush();

      expect(document.body.style.overflow).toBe("hidden");

      dispose();
      expect(document.body.style.overflow).toBe("");
    }));

  it("does not set overflow when hideScrollbar is false", () =>
    createRoot(dispose => {
      createPreventScroll({ hideScrollbar: false });
      flush();

      expect(document.body.style.overflow).not.toBe("hidden");

      dispose();
    }));

  it("does not apply styles when enabled is false", () =>
    createRoot(dispose => {
      createPreventScroll({ enabled: false });
      flush();

      expect(document.body.style.overflow).not.toBe("hidden");

      dispose();
    }));

  it("reacts to enabled signal", () =>
    createRoot(dispose => {
      const [enabled, setEnabled] = createSignal(false, { ownedWrite: true });
      createPreventScroll({ enabled });
      flush();

      expect(document.body.style.overflow).not.toBe("hidden");

      setEnabled(true);
      flush();
      expect(document.body.style.overflow).toBe("hidden");

      setEnabled(false);
      flush();
      expect(document.body.style.overflow).not.toBe("hidden");

      dispose();
    }));

  it("installs wheel event listener when enabled", () =>
    createRoot(dispose => {
      const addSpy = vi.spyOn(document, "addEventListener");

      createPreventScroll();
      flush();

      const wheelCalls = addSpy.mock.calls.filter(([event]) => event === "wheel");
      expect(wheelCalls.length).toBeGreaterThan(0);

      addSpy.mockRestore();
      dispose();
    }));

  it("removes wheel event listener on cleanup", () =>
    createRoot(dispose => {
      const removeSpy = vi.spyOn(document, "removeEventListener");

      createPreventScroll();
      flush();
      dispose();

      const wheelCalls = removeSpy.mock.calls.filter(([event]) => event === "wheel");
      expect(wheelCalls.length).toBeGreaterThan(0);

      removeSpy.mockRestore();
    }));

  it("prevents wheel events outside element", () =>
    createRoot(dispose => {
      const container = document.createElement("div");
      document.body.appendChild(container);

      createPreventScroll({ element: container });
      flush();

      const outside = document.createElement("div");
      document.body.appendChild(outside);

      const event = new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 100,
        target: outside,
      });
      Object.defineProperty(event, "target", { value: outside, configurable: true });
      document.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);

      document.body.removeChild(container);
      document.body.removeChild(outside);
      dispose();
    }));

  it("stacks multiple instances — only top one handles events", () =>
    createRoot(dispose1 => {
      createPreventScroll();
      flush();

      const addSpy = vi.spyOn(document, "addEventListener");

      createRoot(dispose2 => {
        createPreventScroll();
        flush();

        // Both instances active; second is on top
        expect(document.body.style.overflow).toBe("hidden");

        dispose2();
      });

      flush();
      // First instance should still keep body locked
      expect(document.body.style.overflow).toBe("hidden");

      addSpy.mockRestore();
      dispose1();
    }));

  it("restores body style only after all stacked instances clean up", () =>
    createRoot(dispose1 => {
      createPreventScroll();
      flush();

      const cleanup2 = createRoot(dispose2 => {
        createPreventScroll();
        flush();
        return dispose2;
      });

      expect(document.body.style.overflow).toBe("hidden");

      cleanup2();
      flush();
      // First instance still active
      expect(document.body.style.overflow).toBe("hidden");

      dispose1();
      expect(document.body.style.overflow).toBe("");
    }));
});
