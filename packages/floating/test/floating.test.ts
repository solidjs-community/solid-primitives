import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createEffect, createRoot, createSignal, flush } from "solid-js";
import { createFloating, makeAutoUpdate, type Placement } from "../src/index.js";
import { defineGlobal, mockRect, rect } from "./helpers.js";

const restore: (() => void)[] = [];
const disposers: (() => void)[] = [];

beforeEach(() => {
  restore.push(defineGlobal(window, "innerWidth", 1000), defineGlobal(window, "innerHeight", 800));
});
afterEach(() => {
  disposers.splice(0).forEach(fn => fn());
  restore.splice(0).forEach(fn => fn());
  document.body.innerHTML = "";
});

const root = <T>(fn: () => T): T =>
  createRoot(dispose => {
    disposers.push(dispose);
    return fn();
  });

function els(refRect = rect(400, 300, 100, 40)) {
  const reference = mockRect(document.createElement("button"), refRect);
  const floating = mockRect(document.createElement("div"), rect(0, 0, 60, 30));
  document.body.append(reference, floating);
  return { reference, floating };
}

describe("createFloating", () => {
  test("is unpositioned until both elements exist", () => {
    const [reference, setReference] = createSignal<HTMLElement | null>(null);
    const [floating, setFloating] = createSignal<HTMLElement | null>(null);
    const f = root(() => createFloating({ reference, floating }));
    flush();
    expect(f.isPositioned()).toBe(false);
    expect([f.x(), f.y(), f.placement()]).toEqual([0, 0, "bottom"]);
    expect(f.styles()).toEqual({ position: "absolute", top: "0", left: "0" });
    expect(f.middlewareData()).toBeUndefined();

    const e = els();
    setReference(e.reference);
    flush();
    expect(f.isPositioned()).toBe(false);
    setFloating(e.floating);
    flush();
    expect(f.isPositioned()).toBe(true);
    expect([f.x(), f.y(), f.placement()]).toEqual([420, 340, "bottom"]);
  });

  test("computes from plain elements and values", () => {
    const e = els();
    const f = root(() =>
      createFloating({
        reference: e.reference,
        floating: e.floating,
        placement: "top-start",
        offset: 10,
      }),
    );
    flush();
    expect([f.x(), f.y(), f.placement()]).toEqual([400, 260, "top-start"]);
  });

  test("styles use transform by default and top/left on request", () => {
    const e = els();
    const [transform, setTransform] = createSignal(true);
    const f = root(() =>
      createFloating({ reference: e.reference, floating: e.floating, transform }),
    );
    flush();
    expect(f.styles()).toEqual({
      position: "absolute",
      top: "0",
      left: "0",
      transform: "translate(420px, 340px)",
    });
    setTransform(false);
    flush();
    expect(f.styles()).toEqual({ position: "absolute", top: "340px", left: "420px" });
  });

  test("strategy fixed", () => {
    const e = els();
    restore.push(defineGlobal(window, "scrollY", 100));
    const [strategy, setStrategy] = createSignal<"absolute" | "fixed">("fixed");
    const f = root(() =>
      createFloating({ reference: e.reference, floating: e.floating, strategy }),
    );
    flush();
    expect(f.strategy()).toBe("fixed");
    expect(f.styles().position).toBe("fixed");
    expect(f.y()).toBe(340);
    setStrategy("absolute");
    flush();
    expect([f.strategy(), f.y()]).toEqual(["absolute", 440]);
  });

  test("reacts to option changes", () => {
    const e = els();
    const [placement, setPlacement] = createSignal<Placement>("bottom");
    const [offset, setOffset] = createSignal(0);
    const [rtl, setRtl] = createSignal(false);
    const f = root(() =>
      createFloating({ reference: e.reference, floating: e.floating, placement, offset, rtl }),
    );
    flush();
    expect([f.x(), f.y()]).toEqual([420, 340]);
    setPlacement("right-start");
    flush();
    expect([f.x(), f.y(), f.placement()]).toEqual([500, 300, "right-start"]);
    setOffset(8);
    flush();
    expect(f.x()).toBe(508);
    setPlacement("bottom-start");
    setOffset(0);
    flush();
    expect(f.x()).toBe(400);
    setRtl(true);
    flush();
    expect(f.x()).toBe(440);
  });

  test("flip and shift options", () => {
    const e = els(rect(960, 770, 20, 20));
    const f = root(() =>
      createFloating({
        reference: e.reference,
        floating: e.floating,
        placement: "bottom",
        flip: true,
        shift: { padding: 4 },
      }),
    );
    flush();
    expect(f.placement()).toBe("top");
    expect(f.middlewareData()).toMatchObject({ flipped: true, shifted: true });
    expect([f.x(), f.y()]).toEqual([936, 740]);
  });

  test("shift can be toggled live", () => {
    const e = els(rect(960, 300, 20, 20));
    const [shift, setShift] = createSignal(false);
    const f = root(() => createFloating({ reference: e.reference, floating: e.floating, shift }));
    flush();
    expect(f.x()).toBe(940); // 960 + 10 - 30 fits, shift changes nothing
    setShift(true);
    flush();
    expect(f.x()).toBe(940);
  });

  test("arrow element may be a signal", () => {
    const e = els();
    const [arrowEl, setArrowEl] = createSignal<HTMLElement | null>(null);
    const f = root(() =>
      createFloating({
        reference: e.reference,
        floating: e.floating,
        arrow: { element: arrowEl, padding: 4 },
      }),
    );
    flush();
    expect(f.middlewareData()?.arrow).toBeUndefined();
    setArrowEl(mockRect(document.createElement("i"), rect(0, 0, 10, 10)));
    flush();
    expect(f.middlewareData()?.arrow).toEqual({ x: 25, centerOffset: 0 });
  });

  test("size apply and css vars flow through", () => {
    const e = els();
    const apply = vi.fn();
    root(() => createFloating({ reference: e.reference, floating: e.floating, size: { apply } }));
    flush();
    expect(apply).toHaveBeenCalledWith(
      expect.objectContaining({ availableHeight: 460, availableWidth: 580 }),
    );
  });

  test("update() recomputes after the layout changed", () => {
    let box = rect(400, 300, 100, 40);
    const e = els();
    mockRect(e.reference, () => box);
    const f = root(() => createFloating({ reference: e.reference, floating: e.floating }));
    flush();
    expect(f.y()).toBe(340);
    box = rect(400, 500, 100, 40);
    f.update();
    flush();
    expect(f.y()).toBe(540);
  });

  test("update() is a no-op without elements", () => {
    const f = root(() => createFloating({ reference: undefined, floating: () => null }));
    expect(() => f.update()).not.toThrow();
    flush();
    expect(f.isPositioned()).toBe(false);
  });

  test("a new element for the reference repositions", () => {
    const a = els(rect(100, 100, 20, 20));
    const b = mockRect(document.createElement("span"), rect(600, 600, 20, 20));
    document.body.append(b);
    const [reference, setReference] = createSignal<HTMLElement>(a.reference);
    const f = root(() => createFloating({ reference, floating: a.floating }));
    flush();
    expect(f.x()).toBe(100 + 10 - 30);
    setReference(b);
    flush();
    expect([f.x(), f.y()]).toEqual([580, 620]);
  });

  test("does not re-notify when the result is unchanged", () => {
    const e = els();
    const f = root(() => createFloating({ reference: e.reference, floating: e.floating }));
    flush();
    const seen: unknown[] = [];
    root(() => {
      createEffect(f.middlewareData, v => {
        seen.push(v);
      });
    });
    flush();
    expect(seen).toHaveLength(1);
    f.update();
    f.update();
    flush();
    expect(seen).toHaveLength(1);
  });

  describe("whileElementsMounted", () => {
    test("runs with the elements and an update function, cleans up on dispose", () => {
      const e = els();
      const cleanup = vi.fn();
      const mounted = vi.fn(() => cleanup);
      const dispose = root(() => {
        createFloating({
          reference: e.reference,
          floating: e.floating,
          whileElementsMounted: mounted,
        });
        return disposers.pop()!;
      });
      flush();
      expect(mounted).toHaveBeenCalledTimes(1);
      expect(mounted).toHaveBeenCalledWith(e.reference, e.floating, expect.any(Function));
      expect(cleanup).not.toHaveBeenCalled();
      dispose();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    test("waits for both elements and cleans up when one goes away", () => {
      const e = els();
      const [floating, setFloating] = createSignal<HTMLElement | null>(null);
      const cleanup = vi.fn();
      const mounted = vi.fn(() => cleanup);
      root(() =>
        createFloating({ reference: e.reference, floating, whileElementsMounted: mounted }),
      );
      flush();
      expect(mounted).not.toHaveBeenCalled();
      setFloating(e.floating);
      flush();
      expect(mounted).toHaveBeenCalledTimes(1);
      setFloating(null);
      flush();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });

    test("may return nothing", () => {
      const e = els();
      expect(() => {
        root(() =>
          createFloating({
            reference: e.reference,
            floating: e.floating,
            whileElementsMounted: () => {},
          }),
        );
        flush();
      }).not.toThrow();
    });

    test("is not restarted by option changes", () => {
      const e = els();
      const [placement, setPlacement] = createSignal<Placement>("bottom");
      const mounted = vi.fn(() => () => {});
      root(() =>
        createFloating({
          reference: e.reference,
          floating: e.floating,
          placement,
          whileElementsMounted: mounted,
        }),
      );
      flush();
      setPlacement("top");
      flush();
      expect(mounted).toHaveBeenCalledTimes(1);
    });

    test("update passed in recomputes with the latest options", () => {
      const e = els();
      const [placement, setPlacement] = createSignal<Placement>("bottom");
      let update!: () => void;
      const f = root(() =>
        createFloating({
          reference: e.reference,
          floating: e.floating,
          placement,
          whileElementsMounted: (_r, _f, u) => {
            update = u;
          },
        }),
      );
      flush();
      setPlacement("top");
      flush();
      expect(f.placement()).toBe("top");
      update();
      flush();
      expect(f.placement()).toBe("top");
    });

    test("works with makeAutoUpdate: repositions on window scroll", () => {
      let box = rect(400, 300, 100, 40);
      const e = els();
      mockRect(e.reference, () => box);
      const f = root(() =>
        createFloating({
          reference: e.reference,
          floating: e.floating,
          whileElementsMounted: makeAutoUpdate,
        }),
      );
      flush();
      expect(f.y()).toBe(340);
      box = rect(400, 100, 100, 40);
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(f.y()).toBe(140);
    });
  });

  describe("autoUpdate option", () => {
    test("true subscribes to scroll and unsubscribes on dispose", () => {
      let box = rect(400, 300, 100, 40);
      const e = els();
      mockRect(e.reference, () => box);
      const dispose = root(() => {
        const f = createFloating({
          reference: e.reference,
          floating: e.floating,
          autoUpdate: true,
        });
        return Object.assign(disposers.pop()!, { f });
      });
      flush();
      box = rect(400, 100, 100, 40);
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(dispose.f.y()).toBe(140);
      dispose();
      box = rect(400, 50, 100, 40);
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(dispose.f.y()).toBe(140);
    });

    test("takes options and can be toggled", () => {
      const e = els();
      let box = rect(400, 300, 100, 40);
      mockRect(e.reference, () => box);
      const [auto, setAuto] = createSignal<boolean | { ancestorScroll: boolean }>(false);
      const f = root(() =>
        createFloating({ reference: e.reference, floating: e.floating, autoUpdate: auto }),
      );
      flush();
      box = rect(400, 100, 100, 40);
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(f.y()).toBe(340);
      setAuto({ ancestorScroll: false });
      flush();
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(f.y()).toBe(340);
      setAuto(true);
      flush();
      window.dispatchEvent(new Event("scroll"));
      flush();
      expect(f.y()).toBe(140);
    });

    test("whileElementsMounted takes precedence", () => {
      const e = els();
      const mounted = vi.fn();
      const add = vi.spyOn(window, "addEventListener");
      root(() =>
        createFloating({
          reference: e.reference,
          floating: e.floating,
          autoUpdate: true,
          whileElementsMounted: mounted,
        }),
      );
      flush();
      expect(mounted).toHaveBeenCalledTimes(1);
      expect(add.mock.calls.filter(c => c[0] === "scroll")).toHaveLength(0);
      add.mockRestore();
    });
  });
});
