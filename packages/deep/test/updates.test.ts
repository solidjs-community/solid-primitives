import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot, createSignal } from "solid-js";
import { captureStoreUpdates } from "../src";
import { createStore } from "solid-js/store";

describe("createStoreDelta", () => {
  test("initial value", () => {
    const [sign] = createStore({ a: { "a.b": "thoughts" } });
    const diff = captureStoreUpdates(sign);

    expect(diff()).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("captures property change", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set("a", "a.b", "minds");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: { "a.b": "minds" },
      },
    ] satisfies ReturnType<typeof diff>);

    set("b", "bar");
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("multiple changes", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { ab: "thoughts" }, b: { ba: 1 } });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    batch(() => {
      set("a", "ab", "minds");
      set("b", "ba", 2);
    });

    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: { ab: "minds" },
      },
      {
        path: ["b"],
        value: { ba: 2 },
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("ignore leafs on root changes", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    batch(() => {
      set("a", "a.b", "minds");
      set("b", "bar");
    });

    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("returns empty array with no change", () => {
    const captured: any[] = [];
    const [sign] = createStore({ a: { "a.b": "thoughts" } });
    const diff = captureStoreUpdates(sign);
    const [track, trigger] = createSignal(undefined, { equals: false });

    createRoot(() => {
      createEffect(() => {
        track();
        captured.push(diff());
      });
    });

    trigger();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([]);
  });

  test("adding new property", () => {
    const captured: any[] = [];
    const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set("b", "foo");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("removing property", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" as string | undefined });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set("b", undefined);
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("changing objects", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" } });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set({ a: { "a.b": "minds" } });
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: [],
        value: sign,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("array", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: ["foo"] });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set("b", 0, "bar");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["b"],
        value: ["bar"],
      },
    ] satisfies ReturnType<typeof diff>);

    set("b", 1, "baz");
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([
      {
        path: ["b"],
        value: ["bar", "baz"],
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("nested array", () => {
    const captured: any[] = [];
    const [sign, set] = createStore([{ n: 0 }, { n: 1 }]);
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set(0, "n", 1);
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: [0],
        value: { n: 1 },
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("circular reference", () => {
    const captured: any[] = [];
    const [sign, set] = createStore<any>({ a: { aa: "thoughts" } });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(() => {
        captured.push(diff());
      });
    });

    set("a", "ab", sign);
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: sign.a,
      },
    ] satisfies ReturnType<typeof diff>);
  });
});
