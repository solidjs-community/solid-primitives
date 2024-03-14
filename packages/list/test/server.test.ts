import { createSignal } from "solid-js";
import { describe, test, expect } from "vitest";

describe("description", () => {
  test("doesn't break in SSR", () => {
    const [value, setValue] = createSignal(true);
    expect(value(), "initial value should be true").toBe(true);
  });
});
