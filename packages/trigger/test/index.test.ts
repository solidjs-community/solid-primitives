import { createComputed, createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
import { createTriggerCache } from "../src";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  test("autoremoving unobserved keys", () => {
    return createRoot(async dispose => {
      const map = new Map();
      const key = "key";
      const [track, dirty] = createTriggerCache(function () {
        return map;
      } as any);

      createComputed(() => {
        track(key);
      });

      expect(map.size).toBe(1);

      dirty(key);

      expect(map.size).toBe(1);

      dispose();

      await sleep(0);

      expect(map.size).toBe(0);
    });
  });

  test("autoremoving unobserved keys with multiple computations", () => {
    return createRoot(async dispose => {
      const map = new Map();
      const key = "key";
      const [track, dirty] = createTriggerCache(function () {
        return map;
      } as any);

      const [enabled1, setEnabled1] = createSignal(true);
      createComputed(() => {
        if (enabled1()) track(key);
      });
      const [enabled2, setEnabled2] = createSignal(true);
      createComputed(() => {
        if (enabled2()) track(key);
      });

      expect(map.size).toBe(1);

      dirty(key);

      expect(map.size).toBe(1);

      setEnabled1(false);

      await sleep(0);
      expect(map.size).toBe(1);

      setEnabled2(false);

      await sleep(0);
      expect(map.size).toBe(0);

      setEnabled1(true);

      await sleep(0);
      expect(map.size).toBe(1);

      setEnabled2(true);
      setEnabled1(false);

      await sleep(0);

      expect(map.size).toBe(1);

      dispose();

      await sleep(0);

      expect(map.size).toBe(0);
    });
  });
});
