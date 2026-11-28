import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { autoUpdate, makeAutoUpdate } from "../src/index.js";
import { defineGlobal, mockRect, rect } from "./helpers.js";

const restore: (() => void)[] = [];
let observers: MockResizeObserver[] = [];

class MockResizeObserver {
  observed = new Set<Element>();
  disconnected = false;
  constructor(public callback: () => void) {
    observers.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }
}

beforeEach(() => {
  observers = [];
  restore.push(defineGlobal(window, "ResizeObserver", MockResizeObserver));
});
afterEach(() => {
  restore.splice(0).forEach(fn => fn());
  document.body.innerHTML = "";
});

function tree() {
  const scroller = document.createElement("div");
  scroller.style.overflow = "auto";
  const plain = document.createElement("div");
  const reference = mockRect(document.createElement("button"), rect(10, 10, 10, 10));
  scroller.append(plain, reference);
  const floating = mockRect(document.createElement("div"), rect(0, 0, 10, 10));
  document.body.append(scroller, floating);
  return { scroller, plain, reference, floating };
}

describe("makeAutoUpdate", () => {
  test("autoUpdate is an alias", () => {
    expect(autoUpdate).toBe(makeAutoUpdate);
  });

  test("does not call update on setup", () => {
    const { reference, floating } = tree();
    const update = vi.fn();
    makeAutoUpdate(reference, floating, update)();
    expect(update).not.toHaveBeenCalled();
  });

  test("updates on scroll of scrollable ancestors and the window", () => {
    const { scroller, plain, reference, floating } = tree();
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update);
    scroller.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(2);
    // not scrollable: not listened to
    plain.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(2);
    stop();
  });

  test("scroll ancestors of the floating element are observed too", () => {
    const { reference } = tree();
    const portalScroller = document.createElement("div");
    portalScroller.style.overflowY = "scroll";
    const floating = mockRect(document.createElement("div"), rect(0, 0, 1, 1));
    portalScroller.append(floating);
    document.body.append(portalScroller);
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update);
    portalScroller.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(1);
    stop();
  });

  test("a virtual reference uses its contextElement", () => {
    const { scroller, reference, floating } = tree();
    const update = vi.fn();
    const virtual = {
      getBoundingClientRect: () => reference.getBoundingClientRect(),
      contextElement: reference,
    };
    const stop = makeAutoUpdate(virtual, floating, update);
    scroller.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(1);
    expect(observers[0]!.observed.has(reference)).toBe(true);
    stop();
  });

  test("a virtual reference without context still tracks the window", () => {
    const { floating } = tree();
    const update = vi.fn();
    const stop = makeAutoUpdate(
      { getBoundingClientRect: () => rect(0, 0, 0, 0) },
      floating,
      update,
    );
    window.dispatchEvent(new Event("resize"));
    expect(update).toHaveBeenCalledTimes(1);
    expect([...observers[0]!.observed]).toEqual([floating]);
    stop();
  });

  test("updates on window resize and visualViewport events", () => {
    const { reference, floating } = tree();
    const vv = new EventTarget();
    restore.push(defineGlobal(window, "visualViewport", vv));
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update);
    window.dispatchEvent(new Event("resize"));
    vv.dispatchEvent(new Event("resize"));
    vv.dispatchEvent(new Event("scroll"));
    expect(update).toHaveBeenCalledTimes(3);
    stop();
    vv.dispatchEvent(new Event("resize"));
    expect(update).toHaveBeenCalledTimes(3);
  });

  test("observes both elements for resize", () => {
    const { reference, floating } = tree();
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update);
    expect(observers).toHaveLength(1);
    expect([...observers[0]!.observed]).toEqual([reference, floating]);
    observers[0]!.callback();
    expect(update).toHaveBeenCalledTimes(1);
    stop();
    expect(observers[0]!.disconnected).toBe(true);
  });

  test("cleanup removes every listener", () => {
    const { scroller, reference, floating } = tree();
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update);
    stop();
    scroller.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(update).not.toHaveBeenCalled();
  });

  test("cleanup is idempotent", () => {
    const { reference, floating } = tree();
    const stop = makeAutoUpdate(reference, floating, vi.fn());
    stop();
    expect(() => stop()).not.toThrow();
  });

  test("adds and removes the same listeners", () => {
    const { reference, floating } = tree();
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const stop = makeAutoUpdate(reference, floating, vi.fn());
    stop();
    const added = add.mock.calls.map(c => c[0]).sort();
    const removed = remove.mock.calls.map(c => c[0]).sort();
    expect(added).toEqual(["resize", "scroll"]);
    expect(removed).toEqual(added);
    add.mockRestore();
    remove.mockRestore();
  });

  test("options turn individual sources off", () => {
    const { scroller, reference, floating } = tree();
    const update = vi.fn();
    const stop = makeAutoUpdate(reference, floating, update, {
      ancestorScroll: false,
      ancestorResize: false,
      elementResize: false,
    });
    scroller.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(update).not.toHaveBeenCalled();
    expect(observers).toHaveLength(0);
    stop();
  });

  test("works without ResizeObserver", () => {
    restore.push(defineGlobal(window, "ResizeObserver", undefined));
    const { reference, floating } = tree();
    const stop = makeAutoUpdate(reference, floating, vi.fn());
    expect(observers).toHaveLength(0);
    stop();
  });

  describe("animationFrame", () => {
    let frames: Map<number, FrameRequestCallback>;
    let id: number;
    const flushFrame = () => {
      const pending = [...frames.entries()];
      frames.clear();
      pending.forEach(([, cb]) => cb(0));
    };
    beforeEach(() => {
      frames = new Map();
      id = 0;
      restore.push(
        defineGlobal(window, "requestAnimationFrame", (cb: FrameRequestCallback) => {
          frames.set(++id, cb);
          return id;
        }),
        defineGlobal(window, "cancelAnimationFrame", (n: number) => frames.delete(n)),
      );
    });

    test("is off by default", () => {
      const { reference, floating } = tree();
      makeAutoUpdate(reference, floating, vi.fn())();
      expect(frames.size).toBe(0);
    });

    test("updates only on frames where the reference moved", () => {
      const { reference, floating } = tree();
      let box = rect(10, 10, 10, 10);
      mockRect(reference, () => box);
      const update = vi.fn();
      const stop = makeAutoUpdate(reference, floating, update, { animationFrame: true });
      flushFrame();
      flushFrame();
      expect(update).not.toHaveBeenCalled();
      box = rect(15, 10, 10, 10);
      flushFrame();
      expect(update).toHaveBeenCalledTimes(1);
      flushFrame();
      expect(update).toHaveBeenCalledTimes(1);
      stop();
    });

    test("also notices floating size changes", () => {
      const { reference, floating } = tree();
      let box = rect(0, 0, 10, 10);
      mockRect(floating, () => box);
      const update = vi.fn();
      const stop = makeAutoUpdate(reference, floating, update, { animationFrame: true });
      box = rect(0, 0, 20, 10);
      flushFrame();
      expect(update).toHaveBeenCalledTimes(1);
      stop();
    });

    test("cleanup cancels the loop", () => {
      const { reference, floating } = tree();
      const stop = makeAutoUpdate(reference, floating, vi.fn(), { animationFrame: true });
      expect(frames.size).toBe(1);
      flushFrame();
      expect(frames.size).toBe(1);
      stop();
      expect(frames.size).toBe(0);
    });
  });
});
