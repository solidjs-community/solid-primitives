import { describe, test, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createDeep } from "../src";
import { createStore } from "solid-js/store";

describe("createDeep", () => {
  test("createDeep return values", () => {
    let temp: string;
    const [sign, set] = createStore({ a: { b: "thoughts" } });
    createRoot(() => {
      const fn = createDeep(
        () => sign,
        v => (temp = `impure ${JSON.stringify(v)}`),
      );
      createEffect(fn);
    });
    expect(temp!).toBe('impure {"a":{"b":"thoughts"}}');
    set("a", "b", "minds");
    expect(temp!).toBe('impure {"a":{"b":"minds"}}');
  });
});
