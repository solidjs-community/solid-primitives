import { describe, test, expect } from "vitest";
import { createPrimitiveTemplate } from "../src/index.js";

describe("createPrimitiveTemplate", () => {
  test("doesn't break in SSR", () => {
    const [value, setValue] = createPrimitiveTemplate(true);
    expect(value(), "initial value should be true").toBe(true);
  });
});
