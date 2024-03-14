import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";

describe("createPrimitiveTemplate", () => {
  test("createPrimitiveTemplate return values", () => {
    const { value, setValue, dispose } = createRoot(dispose => {
      const [value, setValue] = createSignal(true);
      expect(value(), "initial value should be true").toBe(true);

      return { value, setValue, dispose };
    });

    setValue(false);
    expect(value(), "value after change should be false").toBe(false);

    dispose();
  });
});
