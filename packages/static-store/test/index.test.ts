import { createRoot, createSignal, createTrackedEffect, flush } from "solid-js";
import { describe, expect, test } from "vitest";
import {
  createDerivedStaticStore,
  createHydratableStaticStore,
  createStaticStore,
} from "../src/index.js";

describe("createStaticStore", () => {
  test("individual keys only update when changed", () => {
    let aUpdates = -1;

    const { dispose, setState } = createRoot(dispose => {
      const _shape = { a: 1, b: 2, c: 3, d: [0, 1, 2] };
      const [state, setState] = createStaticStore(_shape);

      expect(state).toEqual(_shape);
      expect(_shape, "original input shouldn't be mutated").toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: [0, 1, 2],
      });

      setState({ a: 9, d: [3, 2, 1] });

      expect(state).toEqual({ a: 9, b: 2, c: 3, d: [3, 2, 1] });
      expect(_shape, "original input shouldn't be mutated").toEqual({
        a: 1,
        b: 2,
        c: 3,
        d: [0, 1, 2],
      });

      setState("a", prev => prev + 1);
      expect(state.a).toBe(10);

      createTrackedEffect(() => {
        state.a;
        aUpdates++;
      });

      return { dispose, setState };
    });

    flush();
    expect(aUpdates).toBe(0);

    setState({ b: 3 });
    flush();
    expect(aUpdates).toBe(0);
    setState("a", 4);
    flush();
    expect(aUpdates).toBe(1);

    dispose();
  });
});

describe("createHydratableStaticStore", () => {
  test("createHydratableStaticStore() - CSR", () => {
    const [state, setState] = createHydratableStaticStore({ foo: "server" }, () => ({
      foo: "client",
    }));
    expect(state).toEqual({ foo: "client" });
    expect(setState).toBeInstanceOf(Function);
  });
});

describe("createDerivedStaticStore", () => {
  test("individual keys only update when changed", () => {
    let aUpdates = -1;
    const _shape = { a: 1, b: 2, c: 3, d: [0, 1, 2] };
    const [s, set] = createSignal(_shape);

    const { dispose, state } = createRoot(dispose => {
      const state = createDerivedStaticStore(s);

      createTrackedEffect(() => {
        state.a;
        aUpdates++;
      });

      return { dispose, state };
    });

    flush();
    expect(state).toEqual(_shape);
    expect(aUpdates).toBe(0);

    set(p => ({ ...p, a: 9, d: [3, 2, 1] }));
    flush();
    expect(state).toEqual({ a: 9, b: 2, c: 3, d: [3, 2, 1] });
    expect(_shape, "original input shouldn't be mutated").toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: [0, 1, 2],
    });
    expect(aUpdates).toBe(1);

    set(p => ({ ...p, b: 3 }));
    flush();
    expect(aUpdates).toBe(1);

    set(p => ({ ...p, a: 4 }));
    flush();
    expect(aUpdates).toBe(2);

    dispose();
  });
});
