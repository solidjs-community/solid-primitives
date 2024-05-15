import { describe, test, expect } from "vitest";
import { createDerivedSpring, createSpring } from "../src/index.js";
import { createSignal } from "solid-js";

describe("createSpring", () => {
  test("doesn't break in SSR", () => {
    const [value, setValue] = createSpring({ progress: 0 });
    expect(value().progress, "initial value should be { progress: 0 }").toBe(0);
  });
});

describe("createDerivedSpring", () => {
  test("doesn't break in SSR", () => {
    const [signal, setSignal] = createSignal({ progress: 0 });
    const value = createDerivedSpring(signal);
    expect(value().progress, "initial value should be { progress: 0 }").toBe(0);
  });
});
