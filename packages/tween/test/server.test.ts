import { describe, test, expect } from "vitest";
import { createSignal } from "solid-js";
import createTween from "../src/index.js";

describe("createTween", () => {
  test("doesn't break in SSR", () => {
    const [value] = createSignal(42);
    const tweened = createTween(value, { duration: 100 });
    expect(tweened()).toBe(42);
  });

  test("returns the target signal on SSR", () => {
    const [value, setValue] = createSignal(0);
    const tweened = createTween(value, {});
    expect(tweened()).toBe(0);
    setValue(100);
    expect(tweened()).toBe(100);
  });
});
