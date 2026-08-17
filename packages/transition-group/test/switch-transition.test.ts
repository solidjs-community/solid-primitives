import { describe, it, expect, vi, test } from "vitest";
import { createEffect, createRoot, createSignal, flush, untrack } from "solid-js";
import { createSwitchTransition } from "../src/index.js";

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

  it("reacts to changes to children", () => {
    const [children, setChildren] = createSignal<Element>();

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, {});
      expect(result()).toHaveLength(0);
      return { result, dispose };
    });

    setChildren(el1);
    flush();
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el1);
    dispose();
  });

  it("transitions element out", () => {
    const [children, setChildren] = createSignal<Element | null>(el1);
    const fn = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, { onExit: fn });
      expect(result()).toHaveLength(1);
      return { result, dispose };
    });

    setChildren(null);
    flush();
    expect(result()).toHaveLength(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

    const done = fn.mock.calls[0]![1];
    done();
    flush();
    expect(result()).toHaveLength(0);

    dispose();
  });

  it("transitions element in", () => {
    const [children, setChildren] = createSignal<Element | null>(null);
    const fn = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, { onEnter: fn });
      expect(result()).toHaveLength(0);
      return { result, dispose };
    });

    setChildren(el1);
    flush();
    expect(result()).toHaveLength(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

    dispose();
  });

  it("transitions element in on appear", () => {
    createRoot(dispose => {
      const fn = vi.fn();

      const result = createSwitchTransition(() => el1, {
        onEnter: fn,
        appear: true,
      });

      flush();
      expect(result()).toHaveLength(1);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith(el1, expect.any(Function));

      dispose();
    });
  });

  it("toggles between two elements", () => {
    const [children, setChildren] = createSignal<Element | null>(el1);
    let counter = 0;
    const enterCb = vi.fn();
    let lastEnterCbVersion = 0;
    const exitCb = vi.fn();
    let lastExitCbVersion = 0;

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, {
        onExit: (e, done) => {
          lastExitCbVersion = ++counter;
          exitCb(e, done);
        },
        onEnter: (e, done) => {
          lastEnterCbVersion = ++counter;
          enterCb(e, done);
        },
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();
      return { result, dispose };
    });

    setChildren(el2);
    flush();
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el2);
    expect(result()[1]).toBe(el1);
    expect(exitCb).toHaveBeenCalledOnce();
    expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));
    expect(enterCb).toHaveBeenCalledOnce();
    expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));
    expect(lastEnterCbVersion, "exit should be called before enter").toBeGreaterThan(
      lastExitCbVersion,
    );

    const exitDone = exitCb.mock.calls[0]![1];
    exitDone();
    flush();
    expect(result()).toHaveLength(1);

    dispose();
  });

  it("toggles between two elements out-in", () => {
    const [children, setChildren] = createSignal<Element | null>(el1);
    const enterCb = vi.fn();
    const exitCb = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, {
        onExit: exitCb,
        onEnter: enterCb,
        mode: "out-in",
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();
      return { result, dispose };
    });

    setChildren(el2);
    flush();
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el1);
    expect(enterCb).not.toHaveBeenCalled();
    expect(exitCb).toHaveBeenCalledOnce();
    expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));

    const exitDone = exitCb.mock.calls[0]![1];
    exitDone();
    flush();
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el2);
    expect(enterCb).toHaveBeenCalledOnce();
    expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));

    dispose();
  });

  it("toggles between two elements in-out", () => {
    const [children, setChildren] = createSignal<Element | null>(el1);
    const enterCb = vi.fn();
    const exitCb = vi.fn();

    const { result, dispose } = createRoot(dispose => {
      const result = createSwitchTransition(children, {
        onExit: exitCb,
        onEnter: enterCb,
        mode: "in-out",
      });
      expect(result()).toHaveLength(1);
      expect(enterCb).not.toHaveBeenCalled();
      expect(exitCb).not.toHaveBeenCalled();
      return { result, dispose };
    });

    setChildren(el2);
    flush();
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el2);
    expect(result()[1]).toBe(el1);
    expect(enterCb).toHaveBeenCalledOnce();
    expect(enterCb).toHaveBeenCalledWith(el2, expect.any(Function));
    expect(exitCb).not.toHaveBeenCalled();

    const enterDone = enterCb.mock.calls[0]![1];
    enterDone();
    flush();
    expect(result()).toHaveLength(2);
    expect(result()[0]).toBe(el2);
    expect(result()[1]).toBe(el1);
    expect(enterCb).toHaveBeenCalledOnce();
    expect(exitCb).toHaveBeenCalledOnce();
    expect(exitCb).toHaveBeenCalledWith(el1, expect.any(Function));

    const exitDone = exitCb.mock.calls[0]![1];
    exitDone();
    flush();
    expect(result()).toHaveLength(1);
    expect(result()[0]).toBe(el2);
    expect(enterCb).toHaveBeenCalledOnce();
    expect(exitCb).toHaveBeenCalledOnce();

    dispose();
  });

  test("updated list should be available in user effects", () => {
    let effRuns = 0;
    const [children, setChildren] = createSignal<Element | null>(el1);

    const dispose = createRoot(dispose => {
      // Transition created first so its internal effect runs before the user effect below.
      const result = createSwitchTransition(children, {});
      expect(result(), "initial").toHaveLength(1);
      expect(result()[0]).toBe(el1);

      createEffect(
        () => children(),
        () => {
          effRuns++;
          expect(untrack(result), "effect after root").toHaveLength(1);
          expect(untrack(result)[0]).toBe(el2);
        },
      );

      return dispose;
    });

    setChildren(el2);
    flush();

    expect(effRuns).toBe(1);

    dispose();
  });
});
