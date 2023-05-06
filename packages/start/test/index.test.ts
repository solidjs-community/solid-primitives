import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";

describe("createPrimitiveTemplate", () => {
  test("createPrimitiveTemplate return values", () =>
    createRoot(dispose => {
      //   const [value, setValue] = createUserTheme("dark");
      //   expect(value(), "initial value should be true").toBe("dark");
      //   setValue("light");
      //   expect(value(), "value after change should be false").toBe("light");
      //   dispose();
      expect(true, "Should definitely be true").toBe(true);
    }));
});
