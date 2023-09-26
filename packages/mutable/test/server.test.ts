import { describe, test, expect } from "vitest";
import { createMutable } from "../src/index.js";

describe("createPrimitiveTemplate", () => {
  test("doesn't break in SSR", () => {
    const mutable = createMutable({ value: 0 });
    expect(mutable.value).toBe(0);

    mutable.value = 1;
    expect(mutable.value).toBe(1);
  });
});
