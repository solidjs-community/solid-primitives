import { createHydratableSignal, createServerSafeSignal } from "../src/index.js";
import { describe, expect, test } from "vitest";

describe("API doesn't break in SSR", () => {
  test("createHydratableSignal() - SSR", () => {
    const [state, setState] = createHydratableSignal("server", () => "client");
    expect(state()).toEqual("server");
    expect(setState).toBeInstanceOf(Function);
  });
});

describe("createServerSafeSignal", () => {
  test("is a plain box on the server: value and updater writes, no signal involved", () => {
    const [count, setCount] = createServerSafeSignal(0);
    expect(count()).toBe(0);
    expect(setCount(5)).toBe(5);
    expect(count()).toBe(5);
    expect(setCount(c => c + 1)).toBe(6);
    expect(count()).toBe(6);
  });
});
