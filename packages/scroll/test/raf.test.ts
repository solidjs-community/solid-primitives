import { createRoot, createEffect, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScrollPosition, makeScrollPositionListener } from "../src/index.js";

const scrollTo = (el: Element, x: number, y: number) => {
  Object.assign(el, { scrollLeft: x, scrollTop: y });
  el.dispatchEvent(new Event("scroll"));
};

describe("raf throttling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("default is unthrottled", () => {
    const el = document.createElement("div");
    const cb = vi.fn();
    const stop = makeScrollPositionListener(el, cb);
    scrollTo(el, 1, 1);
    scrollTo(el, 2, 2);
    expect(cb).toHaveBeenCalledTimes(2);
    stop();
  });

  it("coalesces events to one callback per frame with the settled position", () => {
    const el = document.createElement("div");
    const cb = vi.fn();
    const stop = makeScrollPositionListener(el, cb, { throttle: "raf" });
    scrollTo(el, 1, 1);
    scrollTo(el, 2, 2);
    scrollTo(el, 3, 9);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenLastCalledWith({ x: 3, y: 9 });
    scrollTo(el, 4, 4);
    vi.advanceTimersByTime(16);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenLastCalledWith({ x: 4, y: 4 });
    stop();
  });

  it("cleanup cancels pending frame and removes listener", () => {
    const el = document.createElement("div");
    const cb = vi.fn();
    const stop = makeScrollPositionListener(el, cb, { throttle: "raf" });
    scrollTo(el, 1, 1);
    stop();
    vi.advanceTimersByTime(50);
    scrollTo(el, 2, 2);
    vi.advanceTimersByTime(50);
    expect(cb).not.toHaveBeenCalled();
  });

  it("createScrollPosition writes at most once per frame", () => {
    const el = document.createElement("div");
    const seen: number[][] = [];
    const dispose = createRoot(d => {
      const pos = createScrollPosition(el, { throttle: "raf" });
      createEffect(
        () => [pos.x, pos.y],
        v => void seen.push(v),
      );
      return d;
    });
    flush();
    seen.length = 0;
    scrollTo(el, 5, 5);
    scrollTo(el, 6, 7);
    flush();
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(16);
    flush();
    expect(seen).toEqual([[6, 7]]);
    dispose();
  });

  it("disposing the root cancels the pending frame", () => {
    const el = document.createElement("div");
    const raf = vi.spyOn(globalThis, "cancelAnimationFrame");
    const dispose = createRoot(d => {
      createScrollPosition(el, { throttle: "raf" });
      return d;
    });
    flush();
    scrollTo(el, 5, 5);
    dispose();
    flush();
    expect(raf).toHaveBeenCalled();
    raf.mockRestore();
  });
});
