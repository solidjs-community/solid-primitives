import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import {
  createCallbacksSet,
  createMs,
  createRAF,
  createScheduledLoop,
  targetFPS,
  useGlobalRAF,
} from "../src/index.js";

describe("createRAF", () => {
  it("returns a stopped, noop RAF on the server", () => {
    const [running, start, stop] = createRAF(() => {});
    expect(running()).toBe(false);
    start();
    expect(running()).toBe(false);
    stop();
  });
});

describe("targetFPS", () => {
  it("returns the callback unchanged on the server", () => {
    const cb = () => {};
    expect(targetFPS(cb, 60)).toBe(cb);
  });
});

describe("createMs", () => {
  it("yields zero on the server", () => {
    createRoot(dispose => {
      const ms = createMs(60);
      expect(ms()).toBe(0);
      dispose();
    });
  });
});

describe("createCallbacksSet", () => {
  it("still calls the callbacks on the server", () => {
    let calls = 0;
    const [callback, callbacks] = createCallbacksSet(() => calls++);
    callback();
    callbacks.add(() => calls++);
    callback();
    expect(calls).toBe(3);
  });
});

describe("useGlobalRAF", () => {
  it("returns a stopped, noop loop on the server", () => {
    createRoot(dispose => {
      const [added, add, remove, running, start, stop] = useGlobalRAF()(() => {}, true);
      add();
      start();
      expect(added()).toBe(false);
      expect(running()).toBe(false);
      remove();
      stop();
      dispose();
    });
  });
});

describe("createScheduledLoop", () => {
  it("never schedules on the server", () => {
    let scheduled = 0;
    const [running, start, stop] = createScheduledLoop(
      () => ++scheduled,
      () => {},
    )(() => {});
    start();
    expect(running()).toBe(false);
    expect(scheduled).toBe(0);
    stop();
  });
});
