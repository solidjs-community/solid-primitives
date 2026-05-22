import { describe, test, expect } from "vitest";
import { createEffect, createRoot, createSignal, flush } from "solid-js";
import { createStore, reconcile } from "solid-js";
import { captureStoreUpdates } from "../src/index.js";

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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { s.a["a.b"] = "minds"; });
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: { "a.b": "minds" },
      },
    ] satisfies ReturnType<typeof diff>);

    set(s => { s.b = "bar"; });
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { s.a.ab = "minds"; });
    set(s => { s.b.ba = 2; });
    flush();

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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { s.a["a.b"] = "minds"; });
    set(s => { s.b = "bar"; });
    flush();

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
    const [track, trigger] = createSignal<undefined>(undefined, { equals: false });

    createRoot(() => {
      createEffect(
        () => { track(); return diff(); },
        updates => { captured.push(updates); },
      );
    });
    flush();

    trigger(undefined);
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([]);
  });

  test("adding new property", () => {
    const captured: any[] = [];
    const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
    const diff = captureStoreUpdates(sign);

    createRoot(() => {
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set((s: any) => { s.b = "foo"; });
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { (s as any).b = undefined; });
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(() => ({ a: { "a.b": "minds" } }));
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { s.b[0] = "bar"; });
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["b"],
        value: ["bar"],
      },
    ] satisfies ReturnType<typeof diff>);

    set(s => { (s.b as any)[1] = "baz"; });
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set(s => { s[0].n = 1; });
    flush();
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
      createEffect(
        () => diff(),
        updates => { captured.push(updates); },
      );
    });
    flush();

    set((s: any) => { s.a.ab = sign; });
    flush();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: sign.a,
      },
    ] satisfies ReturnType<typeof diff>);
  });
});
