import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot } from "solid-js";
import { trackDeep, trackStore } from "../src";
import { deepTrack } from "../src/deep-track";
import { createStore, reconcile } from "solid-js/store";

const fns = [deepTrack, trackDeep, trackStore];

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

      set("a", "a.b", "thoughts");
      expect(runs).toBe(3);
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

      let rootRuns = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          rootRuns++;
        });
      });

      let leafRuns = 0;
      createRoot(() => {
        const a = sign.a;
        createEffect(() => {
          fn(a);
          leafRuns++;
        });
      });
      expect(rootRuns).toBe(1);
      expect(leafRuns).toBe(1);

      set("a", "a.b", "minds");
      expect(rootRuns).toBe(2);
      expect(leafRuns).toBe(2);

      set("a", "a.a", "a.a.b", "thoughts");
      expect(rootRuns).toBe(3);
      expect(leafRuns).toBe(3);
    });

    test("doesn't trigger on unrelated changes", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });

      let runs = 0;
      createRoot(() => {
        createEffect(() => fn(sign));
        const a = sign.a;
        createEffect(() => {
          fn(a);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", "foo");
      expect(runs).toBe(1);
    });

    test("reconcile", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn(sign);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", reconcile({ foo: "bar" }));
      expect(runs).toBe(2);

      set("a", "foo", "baz");
      expect(runs).toBe(3);
    });
  });
}
