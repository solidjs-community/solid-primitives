import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot, createSignal } from "solid-js";
import { captureStoreUpdates, trackDeep, trackStore } from "../src";
import { createStore, reconcile, unwrap } from "solid-js/store";

const fns = {
  trackDeep: store => () => trackDeep(store),
  trackStore: store => () => trackStore(store),
  captureUpdates: captureStoreUpdates,
} as const satisfies Record<string, (store: any) => () => void>;
type FnKeys = keyof typeof fns;

const worksWithPOJO: FnKeys[] = ["trackDeep"];

for (const [fnName, createFn] of Object.entries(fns) as [FnKeys, (typeof fns)[FnKeys]][]) {
  describe(fnName, () => {
    test("captures property change", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });

      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", "foo");
      expect(runs).toBe(2);
    });

    test("removing property", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" as string | undefined });
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", undefined);
      expect(runs).toBe(2);
    });

    test("changing objects", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" } });
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let rootRuns = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          rootRuns++;
        });
      });

      let leafRuns = 0;
      createRoot(() => {
        const a = sign.a;
        const fn = createFn(a);
        createEffect(() => {
          fn();
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
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => fn);
        const a = sign.a;
        createEffect(() => {
          createFn(a);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", "foo");
      expect(runs).toBe(1);
    });

    test("reconcile", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", reconcile({ foo: "bar" }));
      expect(runs).toBe(2);

      set("a", "foo", "baz");
      expect(runs).toBe(3);
    });

    test("unwrapped", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" } });
      const unwrapped = unwrap(sign);
      const fn = createFn(unwrapped);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", "a.b", "minds");
      expect(runs).toBe(1);
    });

    test("traversing POJOs", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" } });
      const fn = createFn({ sign });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", "a.b", "minds");
      expect(runs).toBe(worksWithPOJO.includes(fnName) ? 2 : 1);
    });

    test("getters", () => {
      const [count, setCount] = createSignal(0);
      const [sign] = createStore({
        get count() {
          return count();
        },
      });

      const fn = createFn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      setCount(1);
      expect(runs).toBe(2);
    });
  });
}
