import { describe, it, expect, vi, type Mock, beforeEach, afterEach } from "vitest";
import { createMs, createRAF, createScheduledLoop, targetFPS, useGlobalRAF } from "../src/index.js";
import { createRoot } from "solid-js";

describe("createRAF", () => {
  it("calls requestAnimationFrame after start", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(() => {
      const [running, start, stop] = createRAF(ts => {
        expect(typeof ts === "number");
      });
      expect(running()).toBe(false);
      expect(raf).not.toHaveBeenCalled();
      expect(caf).not.toHaveBeenCalled();
      start();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalled();
      stop();
      expect(caf).toHaveBeenCalled();
    });
  });
  it("calls cancelAnimationFrame after dispose", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(dispose => {
      const [running, start] = createRAF(ts => {
        expect(typeof ts === "number");
      });
      expect(running()).toBe(false);
      expect(raf).not.toHaveBeenCalled();
      expect(caf).not.toHaveBeenCalled();
      start();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalled();
      dispose();
      expect(caf).toHaveBeenCalled();
    });
  });
});

describe("createScheduledLoop", () => {
  it("frameloop created with requestAnimationFrame calls requestAnimationFrame after start", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(() => {
      // TODO add better test
      const [running, start, stop] = createScheduledLoop(
        window.requestAnimationFrame,
        window.cancelAnimationFrame,
      )(ts => {
        expect(typeof ts === "number");
      });
      expect(running()).toBe(false);
      expect(raf).not.toHaveBeenCalled();
      expect(caf).not.toHaveBeenCalled();
      start();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalled();
      stop();
      expect(caf).toHaveBeenCalled();
    });
  });
  it("frameloop created with requestAnimationFrame calls cancelAnimationFrame after dispose", () => {
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(dispose => {
      const [running, start] = createRAF(ts => {
        expect(typeof ts === "number");
      });
      expect(running()).toBe(false);
      expect(raf).not.toHaveBeenCalled();
      expect(caf).not.toHaveBeenCalled();
      start();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalled();
      dispose();
      expect(caf).toHaveBeenCalled();
    });
  });
});

describe("targetFPS", () => {
  it("only calls after a frame", () => {
    const callback = vi.fn();
    const fpsFilter = targetFPS(callback, 60);
    expect(callback).not.toHaveBeenCalled();
    fpsFilter(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    fpsFilter(1017);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1024);
    expect(callback).toHaveBeenCalledTimes(2);
    fpsFilter(1034);
    expect(callback).toHaveBeenCalledTimes(3);
  });
});

describe("useGlobalRAF", () => {
  // Note: All roots need to be disposed before each test due to the underlying reactive set not working properly if we don't
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("(Manual start) global RAF singleton calls rafs with the same timestamp", () => {
    // Note on this test: For some reason, the raf is being called twice, once when started (but id doesn't invoke the callback for some strange reason) and once after the timers advance (and the callback is properly invoked).
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(dispose => {
      const timestamps = new Set<number>();
      const createGlobalRAFCallback = useGlobalRAF();
      const callback1: Mock<FrameRequestCallback> = vi.fn(ts => timestamps.add(ts));
      const [added1, add1, remove1, running1, start1, stop1] = createGlobalRAFCallback(callback1);
      const callback2: Mock<FrameRequestCallback> = vi.fn(ts => timestamps.add(ts));
      const [added2, add2, remove2, running2, start2, stop2] = createGlobalRAFCallback(callback2);

      // Queue functions should not be equal
      expect(added1).not.toEqual(added2);
      expect(add1).not.toEqual(add2);
      expect(remove1).not.toEqual(remove2);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();

      // Frameloop functions should be equal because of the singleton
      expect(running1).toEqual(running2);
      expect(start1).toEqual(start2);
      expect(stop1).toEqual(stop2);

      // Aliases
      const running = running1;
      const start = start1;
      const stop = stop1;

      expect(added1()).toBe(false);
      add1();
      expect(added1()).toBe(true);
      expect(added2()).toBe(false);
      expect(running()).toBe(false);
      start();
      vi.advanceTimersToNextFrame();
      expect(running()).toBe(true);
      expect(raf).toHaveBeenCalledTimes(2);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(timestamps.size).toEqual(1);
      stop();
      expect(running()).toBe(false);
      expect(caf).toHaveBeenCalledTimes(1);
      add2();
      expect(added2()).toBe(true);
      start();
      vi.advanceTimersToNextFrame();
      expect(raf).toHaveBeenCalledTimes(4);
      expect(timestamps.size).toEqual(2);
      stop();
      expect(caf).toHaveBeenCalledTimes(2);
      dispose();
    });
  });
  it("(Manual start) global RAF singleton skips callbacks when not added", () => {
    // Note on this test: For some reason, the raf is being called twice, once when started (but id doesn't invoke the callback for some strange reason) and once after the timers advance (and the callback is properly invoked).
    // Running the timer guarantees that the callback is properly tested for invokation
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(dispose => {
      const createGlobalRAFCallback = useGlobalRAF();
      const callback: Mock<FrameRequestCallback> = vi.fn();
      const [added, add, remove, running, start, stop] = createGlobalRAFCallback(callback);

      function runFrame() {
        expect(running()).toBe(false);
        start();
        expect(running()).toBe(true);
        vi.advanceTimersToNextFrame();
        stop();
        expect(running()).toBe(false);
      }

      runFrame();
      add();
      expect(added()).toBe(true);
      expect(running()).toBe(false);
      remove();
      expect(added()).toBe(false);
      runFrame();
      expect(raf).toHaveBeenCalledTimes(4);
      expect(caf).toHaveBeenCalledTimes(2);
      expect(callback).not.toHaveBeenCalled();
      dispose();
    });
  });
  it("(Automatic start) global RAF singleton calls rafs with the same timestamp", () => {
    // Note on this test: For some reason, the raf is being called twice, once when started (but id doesn't invoke the callback for some strange reason) and once after the timers advance (and the callback is properly invoked).
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(dispose => {
      const timestamps = new Set<number>();
      const createGlobalRAFCallback = useGlobalRAF();
      const callback1: Mock<FrameRequestCallback> = vi.fn(ts => timestamps.add(ts));
      const [added1, add1, remove1, running1, start1, stop1] = createGlobalRAFCallback(
        callback1,
        true,
      );
      const callback2: Mock<FrameRequestCallback> = vi.fn(ts => timestamps.add(ts));
      const [added2, add2, remove2, running2, start2, stop2] = createGlobalRAFCallback(
        callback2,
        true,
      );

      // Queue functions should not be equal
      expect(added1).not.toEqual(added2);
      expect(add1).not.toEqual(add2);
      expect(remove1).not.toEqual(remove2);
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();

      // Frameloop functions should be equal because of the singleton
      expect(running1).toEqual(running2);
      expect(start1).toEqual(start2);
      expect(stop1).toEqual(stop2);

      // Aliases
      const running = running1;
      const stop = stop1;

      expect(added1()).toBe(false);
      add1();
      expect(added1()).toBe(true);
      expect(added2()).toBe(false);
      expect(running()).toBe(true);
      vi.advanceTimersToNextFrame();
      expect(raf).toHaveBeenCalledTimes(2);
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(timestamps.size).toEqual(1);
      stop();
      expect(running()).toBe(false);
      expect(caf).toHaveBeenCalledTimes(1);
      add2();
      expect(added2()).toBe(true);
      expect(running()).toBe(true);
      vi.advanceTimersToNextFrame();
      expect(raf).toHaveBeenCalledTimes(4);
      expect(timestamps.size).toEqual(2);
      remove1();
      remove2();
      vi.waitUntil(() => {
        expect(running()).toBe(false);
        expect(caf).toHaveBeenCalledTimes(2);
      });
      dispose();
    });
  });
  it("(Automatic start) global RAF singleton skips callbacks when not added", () => {
    // Running the timer guarantees that the callback is properly tested for invokation
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");
    createRoot(() => {
      const createGlobalRAFCallback = useGlobalRAF();
      const callback: Mock<FrameRequestCallback> = vi.fn();
      const [_added, _add, _remove, running, start, stop] = createGlobalRAFCallback(callback, true);

      expect(running()).toBe(false);
      start();
      expect(running()).toBe(true);
      vi.advanceTimersToNextFrame();
      stop();
      expect(running()).toBe(false);
      expect(raf).toHaveBeenCalledTimes(1);
      expect(caf).toHaveBeenCalledTimes(1);
      expect(callback).not.toHaveBeenCalled();
    });
  });
  it("(All) frameloop dispose stops the execution and cancels all callbacks", () => {
    // Note on this test: For some reason, the raf is being called twice, once when started (but id doesn't invoke the callback for some strange reason) and once after the timers advance (and the callback is properly invoked).
    const raf = vi.spyOn(window, "requestAnimationFrame");
    const caf = vi.spyOn(window, "cancelAnimationFrame");

    // Manual
    createRoot(dispose => {
      const createGlobalRAFCallback = useGlobalRAF();
      const callback: Mock<FrameRequestCallback> = vi.fn();
      const [added, add, _remove, running, start, _stop] = createGlobalRAFCallback(callback);

      expect(added()).toBe(false);
      add();
      expect(added()).toBe(true);
      expect(raf).not.toHaveBeenCalled();
      expect(caf).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
      expect(running()).toBe(false);
      start();
      expect(running()).toBe(true);
      vi.advanceTimersToNextFrame();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(raf).toHaveBeenCalledTimes(2);
      dispose();
      vi.waitUntil(() => {
        expect(caf).toHaveBeenCalledTimes(1);
      });
    });
  });
});

describe("createMs", () => {
  it("yields a timestamp starting at approximately zero", () => {
    createRoot(() => {
      const ms = createMs(60);
      expect(ms()).toBeLessThanOrEqual(3);
      ms.stop();
    });
  });
});
