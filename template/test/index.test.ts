import { createPrimitiveTemplate } from "../src";
import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";

describe("createPrimitiveTemplate", () => {
  test("createPrimitiveTemplate return values", () =>
    createRoot(dispose => {
      const [value, setValue] = createPrimitiveTemplate(true);
      expect(value(), "initial value should be true")(true);
      setValue(false);
      expect(value(), "value after change should be false")(false);
      dispose();
    }));
});
