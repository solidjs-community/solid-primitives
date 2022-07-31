import { createComputed, createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { createWeakTriggerCache, createTriggerCache } from "../src";

describe("createTriggerCache", () => {
  test("weak trigger cache", () =>
    createRoot(dispose => {
      const { dirty, track } = createWeakTriggerCache();
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
      const { dirty, track, dirtyAll } = createTriggerCache();
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
      dirtyAll();
      expect(runs1).toBe(2);
      expect(runs2).toBe(2);

      dispose();
    }));
});
