import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot, createSignal } from "solid-js";
import { captureStoreUpdates, trackDeep, trackStore } from "../src/index.js";
import { createStore, reconcile, unwrap } from "solid-js/store";

const apis: {
  name: string;
  fn: (store: any) => () => void;
  pojo: boolean;
}[] = [
  {
    name: "trackDeep",
    fn: store => () => trackDeep(store),
    pojo: true,
  },
  {
    name: "trackStore",
    fn: store => () => trackStore(store),
    pojo: false,
  },
  {
    name: "captureUpdates",
    fn: captureStoreUpdates,
    pojo: false,
  },
];

for (const api of apis) {
  describe(api.name, () => {
    test("captures property change", () => {
      const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });

      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      const fn = api.fn(sign);

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
      type Ref = { ref: Ref; count: number };
      const ref: Ref = { ref: null as any, count: 0 };
      ref.ref = ref;

      const [sign, set] = createStore(ref);
      const fn = api.fn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs += 1;
        });
      });
      expect(runs).toBe(1);

      set("count", 1);
      expect(runs).toBe(2);
    });

    test("circular reference, two effects", () => {
      type Ref = { ref: Ref; count: number };
      const ref: Ref = { ref: null as any, count: 0 };
      ref.ref = ref;

      const [sign, set] = createStore(ref);
      const fn_root = api.fn(sign);
      const fn_leaf = api.fn(sign.ref);

      let runs_root = 0;
      let runs_leaf = 0;

      createRoot(() => {
        createEffect(() => {
          fn_root();
          runs_root += 1;
        });
        createEffect(() => {
          fn_leaf();
          runs_leaf += 1;
        });
      });

      expect(runs_root).toBe(1);
      expect(runs_leaf).toBe(1);

      set("count", 1);
      expect(runs_root).toBe(2);
      expect(runs_leaf).toBe(2);
    });

    test("multiple references", () => {
      const obj = { count: 0 };
      const [sign, set] = createStore({ a: obj, b: obj });

      const fn = api.fn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });

      expect(runs).toBe(1);

      set("a", "count", 1);
      expect(runs).toBe(2);

      set("b", "count", 2);
      expect(runs).toBe(3);
    });

    test("multiple references, two effects", () => {
      const obj = { count: 0 };
      const [sign, set] = createStore({ a: obj, b: obj });

      const fn_a = api.fn(sign.a);
      const fn_b = api.fn(sign.b);

      let runs_a = 0;
      let runs_b = 0;

      createRoot(() => {
        createEffect(() => {
          fn_a();
          runs_a++;
        });
        createEffect(() => {
          fn_b();
          runs_b++;
        });
      });

      expect(runs_a).toBe(1);
      expect(runs_b).toBe(1);

      set("a", "count", 1);
      expect(runs_a).toBe(2);
      expect(runs_b).toBe(2);

      set("b", "count", 2);
      expect(runs_a).toBe(3);
      expect(runs_b).toBe(3);
    });

    test("doesn't trigger on unrelated changes", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
      const fn = api.fn(sign);

      let runs = 0;
      createRoot(() => {
        createEffect(() => fn);
        const a = sign.a;
        createEffect(() => {
          api.fn(a);
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("b", "foo");
      expect(runs).toBe(1);
    });

    test("reconcile", () => {
      const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
      const fn = api.fn(sign);

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
      const fn = api.fn(unwrapped);

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
      const fn = api.fn({ sign });

      let runs = 0;
      createRoot(() => {
        createEffect(() => {
          fn();
          runs++;
        });
      });
      expect(runs).toBe(1);

      set("a", "a.b", "minds");
      if (api.pojo) {
        expect(runs).toBe(2);
      } else {
        expect(runs).toBe(1);
      }
    });

    test("getters", () => {
      const [count, setCount] = createSignal(0);
      const [sign] = createStore({
        get count() {
          return count();
        },
      });

      const fn = api.fn(sign);

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
