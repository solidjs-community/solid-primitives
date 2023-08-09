import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createPrimitiveTemplate } from "../src/index.js";

describe("createPrimitiveTemplate", () => {
  test("createPrimitiveTemplate return values", () =>
    createRoot(dispose => {
      const [value, setValue] = createPrimitiveTemplate(true);
      expect(value(), "initial value should be true").toBe(true);
      setValue(false);
      expect(value(), "value after change should be false").toBe(false);
      dispose();
    }));
});
