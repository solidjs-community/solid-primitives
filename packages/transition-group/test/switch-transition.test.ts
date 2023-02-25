import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createSwitchTransition } from "../src";

describe("createSwitchTransition", () => {
  const el1 = document.createElement("div");
  const el2 = document.createElement("div");

  it("renders items immediately on the initial run", () =>
    createRoot(dispose => {
      const result = createSwitchTransition(() => el1, {});
      expect(result()).toHaveLength(1);
      expect(result()[0]).toBe(el1);
      dispose();
    }));

  it("reacts to changes to children", () =>
    createRoot(dispose => {
      const [children, setChildren] = createSignal<Element>();
      const result = createSwitchTransition(children, {});
      expect(result()).toHaveLength(0);

      setChildren(el1);
      expect(result()).toHaveLength(1);
      expect(result()[0]).toBe(el1);
      dispose();
    }));

  it("transitions element out", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element | null>(el1);
      const fn = vi.fn();
      const result = createSwitchTransition(children, {
        onExit: fn,
      });
      expect(result()).toHaveLength(1);

      setChildren(null);
      expect(result()).toHaveLength(1);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

      const done = fn.mock.calls[0]![1];
      done();
      expect(result()).toHaveLength(0);

      dispose();
    });
  });

  it("transitions element in", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element | null>(null);
      const fn = vi.fn();
      const result = createSwitchTransition(children, {
        onEnter: fn,
      });
      expect(result()).toHaveLength(0);

      setChildren(el1);
      expect(result()).toHaveLength(1);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

      dispose();
    });
  });

  it("transitions element in on appear", () => {
    return createRoot(dispose => {
      const fn = vi.fn();
      const result = createSwitchTransition(() => el1, {
        onEnter: fn,
        appear: true,
      });
      expect(result()).toHaveLength(1);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

      dispose();
    });
  });

  it("toggles between two elements", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element | null>(el1);
      const enterCb = vi.fn();
      const exitCb = vi.fn();
      const result = createSwitchTransition(children, {
        onExit: exitCb,
        onEnter: enterCb,
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();

      setChildren(el2);
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el2);
      expect(result()[1]).toBe(el1);
      expect(enterCb).toHaveBeenCalledOnce();
      expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));
      expect(exitCb).toHaveBeenCalledOnce();
      expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));

      const exitDone = exitCb.mock.calls[0]![1];
      exitDone();
      expect(result()).toHaveLength(1);

      dispose();
    });
  });

  it("toggles between two elements out-in", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element | null>(el1);
      const enterCb = vi.fn();
      const exitCb = vi.fn();
      const result = createSwitchTransition(children, {
        onExit: exitCb,
        onEnter: enterCb,
        mode: "out-in",
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();

      setChildren(el2);
      expect(result()).toHaveLength(1);
      expect(result()[0]).toBe(el1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).toHaveBeenCalledOnce();
      expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));

      const exitDone = exitCb.mock.calls[0]![1];
      exitDone();
      expect(result()).toHaveLength(1);
      expect(result()[0]).toBe(el2);
      expect(enterCb).toHaveBeenCalledOnce();
      expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));

      dispose();
    });
  });

  it("toggles between two elements in-out", () => {
    return createRoot(dispose => {
      const [children, setChildren] = createSignal<Element | null>(el1);
      const enterCb = vi.fn();
      const exitCb = vi.fn();
      const result = createSwitchTransition(children, {
        onExit: exitCb,
        onEnter: enterCb,
        mode: "in-out",
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();

      setChildren(el2);
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el2);
      expect(result()[1]).toBe(el1);
      expect(enterCb).toHaveBeenCalledOnce();
      expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));
      expect(exitCb).not.toHaveBeenCalled();

      const enterDone = enterCb.mock.calls[0]![1];
      enterDone();
      expect(result()).toHaveLength(2);
      expect(result()[0]).toBe(el2);
      expect(result()[1]).toBe(el1);
      expect(enterCb).toHaveBeenCalledOnce();
      expect(exitCb).toHaveBeenCalledOnce();
      expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));

      const exitDone = exitCb.mock.calls[0]![1];
      exitDone();
      expect(result()).toHaveLength(1);
      expect(result()[0]).toBe(el2);
      expect(enterCb).toHaveBeenCalledOnce();
      expect(exitCb).toHaveBeenCalledOnce();

      dispose();
    });
  });
});
