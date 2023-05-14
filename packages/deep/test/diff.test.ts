import { describe, test, expect } from "vitest";
import { batch, createEffect, createRoot, createSignal } from "solid-js";
import { createStoreDiff } from "../src";
import { createStore } from "solid-js/store";

describe("createStoreDiff", () => {
  test("initial value", () => {
    const [sign] = createStore({ a: { "a.b": "thoughts" } });
    const diff = createStoreDiff<typeof sign>();

    expect(diff(sign)).toEqual([
      {
        path: [],
        value: sign,
        prev: undefined,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("captures property change", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });
    const diff = createStoreDiff<typeof sign>();

    createRoot(() => {
      createEffect(() => {
        captured.push(diff(sign));
      });
    });

    set("a", "a.b", "minds");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a", "a.b"],
        value: "minds",
        prev: "thoughts",
      },
    ] satisfies ReturnType<typeof diff>);

    set("b", "bar");
    expect(captured).toHaveLength(3);
    expect(captured[2]).toEqual([
      {
        path: ["b"],
        value: "bar",
        prev: "foo",
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("multiple changes", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" });
    const diff = createStoreDiff<typeof sign>();

    createRoot(() => {
      createEffect(() => {
        captured.push(diff(sign));
      });
    });

    batch(() => {
      set("a", "a.b", "minds");
      set("b", "bar");
    });

    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a", "a.b"],
        value: "minds",
        prev: "thoughts",
      },
      {
        path: ["b"],
        value: "bar",
        prev: "foo",
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("returns empty array with no change", () => {
    const captured: any[] = [];
    const [sign] = createStore({ a: { "a.b": "thoughts" } });
    const diff = createStoreDiff<typeof sign>();
    const [track, trigger] = createSignal(undefined, { equals: false });

    createRoot(() => {
      createEffect(() => {
        track();
        captured.push(diff(sign));
      });
    });

    trigger();
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([]);
  });

  test("adding new property", () => {
    const captured: any[] = [];
    const [sign, set] = createStore<any>({ a: { "a.b": "thoughts" } });
    const diff = createStoreDiff<typeof sign>();

    createRoot(() => {
      createEffect(() => {
        captured.push(diff(sign));
      });
    });

    set("b", "foo");
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["b"],
        value: "foo",
        prev: undefined,
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("removing property", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" }, b: "foo" as string | undefined });
    const diff = createStoreDiff<typeof sign>();

    createRoot(() => {
      createEffect(() => {
        captured.push(diff(sign));
      });
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      {
        path: [],
        value: sign,
        prev: undefined,
      },
    ] satisfies ReturnType<typeof diff>);

    set("b", undefined);
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["b"],
        value: undefined,
        prev: "foo",
      },
    ] satisfies ReturnType<typeof diff>);
  });

  test("changing objects", () => {
    const captured: any[] = [];
    const [sign, set] = createStore({ a: { "a.b": "thoughts" } });
    const diff = createStoreDiff<typeof sign>();

    createRoot(() => {
      createEffect(() => {
        captured.push(diff(sign));
      });
    });

    expect(captured).toHaveLength(1);
    expect(captured[0]).toEqual([
      {
        path: [],
        value: sign,
        prev: undefined,
      },
    ] satisfies ReturnType<typeof diff>);

    set({ a: { "a.b": "minds" } });
    expect(captured).toHaveLength(2);
    expect(captured[1]).toEqual([
      {
        path: ["a"],
        value: { "a.b": "minds" },
        prev: { "a.b": "thoughts" },
      },
    ] satisfies ReturnType<typeof diff>);
  });
});
