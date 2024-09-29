import { createComputed, createEffect, createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
import { createTriggerCache } from "../src/index.js";

describe("createTriggerCache", () => {
  test("weak trigger cache", () =>
    createRoot(dispose => {
      const [track, dirty] = createTriggerCache(WeakMap);
      let runs = -1;
      const key1 = {};
      const key2 = {};
      createComputed(() => {
        track(key1);
        runs++;
      });
      expect(runs).toBe(0);
      dirty(key2);
      expect(runs).toBe(0);
      dirty(key1);
      expect(runs).toBe(1);

      dispose();
    }));

  test("dirtyAll", () =>
    createRoot(dispose => {
      const [track, , dirtyAll] = createTriggerCache(Map);
      let runs = -1;
      createComputed(() => {
        track(1);
        runs++;
      });
      expect(runs).toBe(0);
      dirtyAll();
      expect(runs).toBe(1);

      dispose();
    }));

  test("weak trigger cache", () =>
    createRoot(dispose => {
      const [track, dirty] = createTriggerCache();
      let runs1 = -1;
      let runs2 = -1;
      const key1 = "key1";
      const key2 = "key2";
      createComputed(() => {
        track(key1);
        runs1++;
      });
      createComputed(() => {
        track(key2);
        runs2++;
      });
      expect(runs1).toBe(0);
      expect(runs2).toBe(0);
      dirty(key2);
      expect(runs1).toBe(0);
      expect(runs2).toBe(1);
      dirty(key1);
      expect(runs1).toBe(1);
      expect(runs2).toBe(1);

      dispose();
    }));

  test("autoremoving unobserved keys", async () => {
    const map = new Map();
    const key = "key";

    const { dirty, dispose } = createRoot(dispose => {
      const [track, dirty] = createTriggerCache(function () {
        return map;
      } as any);

      createEffect(() => {
        track(key);
      });

      return { dirty, dispose };
    });

    expect(map.size).toBe(1);

    dirty(key);

    expect(map.size).toBe(1);

    dispose();

    await Promise.resolve();

    expect(map.size).toBe(0);
  });

  test("autoremoving unobserved keys with multiple computations", async () => {
    const map = new Map();
    const key = "key";

    const [enabled1, setEnabled1] = createSignal(true);
    const [enabled2, setEnabled2] = createSignal(true);

    const { dirty, dispose } = createRoot(dispose => {
      const [track, dirty] = createTriggerCache(function () {
        return map;
      } as any);

      createComputed(() => {
        if (enabled1()) track(key);
      });
      createComputed(() => {
        if (enabled2()) track(key);
      });

      return { dirty, dispose };
    });

    expect(map.size).toBe(1);

    dirty(key);

    expect(map.size).toBe(1);

    setEnabled1(false);

    await Promise.resolve();
    expect(map.size).toBe(1);

    setEnabled2(false);

    await Promise.resolve();
    expect(map.size).toBe(0);

    setEnabled1(true);

    await Promise.resolve();
    expect(map.size).toBe(1);

    setEnabled2(true);
    setEnabled1(false);

    await Promise.resolve();

    expect(map.size).toBe(1);

    dispose();

    await Promise.resolve();

    expect(map.size).toBe(0);
  });
});
