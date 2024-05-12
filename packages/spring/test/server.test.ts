import { describe, test, expect } from "vitest";
import { createSpring } from "../src/index.js";

describe("createSpring", () => {
  test("doesn't break in SSR", () => {
    const [value, setValue] = createSpring({ progress: 0 });
    expect(value().progress, "initial value should be { progress: 0 }").toBe(0);
  });
});
