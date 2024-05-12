import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createSpring } from "../src/index.js";

describe("createSpring", () => {
  test("createSpring return values", () => {
    const { value, setValue, dispose } = createRoot(dispose => {
      const [value, setValue] = createSpring({ progress: 0 });
      expect(value().progress, "initial value should be { progress: 0 }").toBe(0);

      return { value, setValue, dispose };
    });

    setValue({ progress: 100 });

    dispose();
  });
  // TODO: Add more tests.
});
