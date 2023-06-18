import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { useTabVisibility } from "../src";
describe("useTabVisibility", () => {
  test("Returns true if the visibility state is visible", () =>
    createRoot(dispose => {
      const visibility = useTabVisibility();
      expect(visibility()).toBe(true);
      dispose();
    }));
  test("Returns false if the visibility state is hidden", () => {
    globalThis.document = { visibilityState: "hidden" } as any;
    createRoot(dispose => {
      const visibility = useTabVisibility();
      expect(visibility()).toBe(false);
      dispose();
    });
  });
});
