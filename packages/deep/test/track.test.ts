import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot } from "solid-js";
import { deepTrack, trackStore1, trackStore2, trackStore3 } from "../src";
import { createStore } from "solid-js/store";

const fns = [deepTrack, trackStore1, trackStore2, trackStore3];

for (const fn of fns) {
  describe(fn.name, () => {
    test("captures property change", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });

      expect(runs).toBe(1);

      set("a", "a.b", "minds");
      expect(runs).toBe(2);

      set("b", "bar");
      expect(runs).toBe(3);
    });

    test("multiple effects", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });

      expect(runs).toBe(2);

      set("a", "a.b", "minds");
      expect(runs).toBe(4);

      set("b", "bar");
      expect(runs).toBe(6);
    });

    test("multiple changes", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      batch(() => {
        set("a", "a.b", "minds");
        set("b", "bar");
      });
      expect(runs).toBe(2);
    });

    test("adding new property", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", "foo");
      expect(runs).toBe(2);
    });

    test("removing property", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" as string | undefined });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", undefined);
      expect(runs).toBe(2);
    });

    test("changing objects", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" } });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set({ a: { "a.b": "minds" } });
      expect(runs).toBe(2);
    });

    test("array reorder", () => {
      const [sign, set] = createStore({ a: [1, 2, 3] });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", [2, 3, 1]);
      expect(runs).toBe(2);
    });

    test("circular reference", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
      set("a", { "a.a": sign });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", "a.b", "minds");
      expect(runs).toBe(2);
    });
  });
}
