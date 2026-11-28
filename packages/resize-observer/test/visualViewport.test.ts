import { describe, test, expect, afterEach, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import {
  getVisualViewport,
  makeVisualViewportListener,
  createVisualViewport,
  useVisualViewport,
} from "../src/index.js";

class MockVV extends EventTarget {
  width = 400;
  height = 800;
  offsetTop = 0;
  offsetLeft = 0;
  pageTop = 0;
  pageLeft = 0;
  scale = 1;
}

const setVV = (vv: unknown) =>
  Object.defineProperty(window, "visualViewport", {
    value: vv,
    configurable: true,
    writable: true,
  });

afterEach(() => {
  setVV(undefined);
  vi.restoreAllMocks();
});

describe("visual viewport", () => {
  test("getVisualViewport reads the mock", () => {
    const vv = new MockVV();
    vv.scale = 2;
    vv.offsetTop = 10;
    setVV(vv);
    expect(getVisualViewport()).toEqual({
      width: 400,
      height: 800,
      offsetTop: 10,
      offsetLeft: 0,
      pageTop: 0,
      pageLeft: 0,
      scale: 2,
    });
  });

  test("falls back to window size when unsupported", () => {
    setVV(undefined);
    const s = getVisualViewport();
    expect(s.width).toBe(window.innerWidth);
    expect(s.height).toBe(window.innerHeight);
    expect(s.scale).toBe(1);
    expect(s.offsetTop).toBe(0);
  });

  test("makeVisualViewportListener fires on resize/scroll and cleans up", () => {
    const vv = new MockVV();
    setVV(vv);
    const cb = vi.fn();
    const clear = makeVisualViewportListener(cb);
    vv.height = 500;
    vv.dispatchEvent(new Event("resize"));
    vv.offsetTop = 5;
    vv.dispatchEvent(new Event("scroll"));
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls[1]![0].offsetTop).toBe(5);
    clear();
    vv.dispatchEvent(new Event("resize"));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  test("listener uses window resize in fallback mode", () => {
    const cb = vi.fn();
    const clear = makeVisualViewportListener(cb);
    window.dispatchEvent(new Event("resize"));
    expect(cb).toHaveBeenCalledTimes(1);
    clear();
  });

  test("raf coalescing", () => {
    const vv = new MockVV();
    setVV(vv);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(cb => frames.push(cb));
    const cb = vi.fn();
    const clear = makeVisualViewportListener(cb, { raf: true });
    vv.dispatchEvent(new Event("resize"));
    vv.dispatchEvent(new Event("scroll"));
    expect(cb).not.toHaveBeenCalled();
    expect(frames).toHaveLength(1);
    frames[0]!(0);
    expect(cb).toHaveBeenCalledTimes(1);
    clear();
  });

  test("raf pending frame is cancelled on cleanup", () => {
    const vv = new MockVV();
    setVV(vv);
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 7);
    const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    const clear = makeVisualViewportListener(() => {}, { raf: true });
    vv.dispatchEvent(new Event("resize"));
    clear();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  test("createVisualViewport is reactive", () => {
    const vv = new MockVV();
    setVV(vv);
    const dispose = createRoot(d => {
      const state = createVisualViewport();
      expect(state.height).toBe(800);
      vv.height = 450;
      vv.scale = 1.5;
      vv.dispatchEvent(new Event("resize"));
      flush();
      expect(state.height).toBe(450);
      expect(state.scale).toBe(1.5);
      return d;
    });
    dispose();
    vv.height = 100;
    vv.dispatchEvent(new Event("resize"));
    flush();
  });

  test("createVisualViewport removes listeners on dispose", () => {
    const vv = new MockVV();
    setVV(vv);
    const add = vi.spyOn(vv, "addEventListener");
    const remove = vi.spyOn(vv, "removeEventListener");
    const dispose = createRoot(d => {
      createVisualViewport();
      return d;
    });
    expect(add).toHaveBeenCalledTimes(2);
    dispose();
    expect(remove).toHaveBeenCalled();
  });

  test("useVisualViewport returns a shared object", () => {
    const vv = new MockVV();
    setVV(vv);
    createRoot(() => {
      const a = useVisualViewport();
      const b = useVisualViewport();
      expect(a).toBe(b);
      expect(a.width).toBe(400);
    });
  });
});
