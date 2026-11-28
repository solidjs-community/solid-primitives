import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import {
  createPolled,
  createIntervalCounter,
  makePausableTimer,
  createPausableTimer,
} from "../src/index.js";

describe("timer (server)", () => {
  test("createPolled runs fn once with the initial value and never updates", () =>
    createRoot(dispose => {
      let calls = 0;
      const p = createPolled(prev => (calls++, prev + 1), 100, 10);
      expect(p()).toBe(11);
      expect(p()).toBe(11);
      expect(calls).toBe(1);
      dispose();
    }));

  test("createIntervalCounter is 0", () =>
    createRoot(dispose => {
      expect(createIntervalCounter(100)()).toBe(0);
      dispose();
    }));

  test("makePausableTimer is inert and never fires", () => {
    let calls = 0;
    const t = makePausableTimer(() => calls++, 100);
    t.start();
    t.pause();
    t.resume();
    t.reset();
    expect(t.remaining()).toBe(100);
    expect(t.isActive()).toBe(false);
    expect(t.isPaused()).toBe(false);
    t.setDelay(50);
    expect(t.remaining()).toBe(50);
    t.stop();
    t.clear();
    expect(calls).toBe(0);
  });

  test("createPausableTimer is inert, with static accessors", () =>
    createRoot(dispose => {
      let calls = 0;
      const t = createPausableTimer(
        () => calls++,
        () => 250,
        { pauseWhenHidden: true },
      );
      t.start();
      t.pause();
      t.resume();
      t.reset();
      t.stop();
      expect(t.isActive()).toBe(false);
      expect(t.isPaused()).toBe(false);
      expect(t.remaining()).toBe(250);
      expect(calls).toBe(0);
      dispose();
    }));
});
