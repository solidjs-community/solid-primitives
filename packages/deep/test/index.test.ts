import { describe, test, expect } from "vitest";
import { createEffect, createRoot, on } from "solid-js";
import { deepTrack } from "../src";
import { createStore } from "solid-js/store";

describe("deepTrack", () => {
  test("deepTrack triggers effect", () => {
    let temp: string;
    const [sign, set] = createStore({ a: { b: "thoughts" } });
    createRoot(() => {
      createEffect(
        on(
          () => deepTrack(sign),
          v => (temp = `impure ${JSON.stringify(v)}`),
        ),
      );
    });
    expect(temp!).toBe('impure {"a":{"b":"thoughts"}}');
    set("a", "b", "minds");
    expect(temp!).toBe('impure {"a":{"b":"minds"}}');
  });

  test("effect without deepTrack doesn't trigger it", () => {
    let temp: string;
    const [sign, set] = createStore({ a: { b: "thoughts" } });
    createRoot(() => {
      createEffect(
        on(
          () => sign,
          v => (temp = `impure ${JSON.stringify(v)}`),
        ),
      );
    });
    expect(temp!).toBe('impure {"a":{"b":"thoughts"}}');
    set("a", "b", "minds");
    expect(temp!).toBe('impure {"a":{"b":"thoughts"}}');
  });

  test("deep derivative", () => {
    let temp: string;
    const [sign, set] = createStore({ a: { b: "thoughts" } });
    createRoot(() => {
      const derivativeDeep = () => deepTrack(sign);
      createEffect(() => {
        temp = `impure ${JSON.stringify(derivativeDeep())}`;
      });
    });
    expect(temp!).toBe('impure {"a":{"b":"thoughts"}}');
    set("a", "b", "minds");
    expect(temp!).toBe('impure {"a":{"b":"minds"}}');
  });

  test("deep circular references", () => {
    let temp: any;
    const initialObject = { a: { b: "thoughts" } } as any;
    initialObject.a.c = initialObject;
    const [sign, set] = createStore(initialObject);

    createRoot(() => {
      const storeDeep = () => deepTrack(sign);
      createEffect(() => {
        temp = storeDeep();
      });
    });

    expect(temp!.a.c).toBe(sign);
    set("a", "c", "minds");
    expect(temp!.a.c).toBe("minds");
  });
});
