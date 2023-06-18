import { describe, test, expect } from "vitest";
import { useTabVisibility } from "../src";

describe("useTabVisibility", () => {
  test("Returns true on the server", () => {
    const visibility = useTabVisibility();
    expect(visibility(), "Visibility should be true on the server").toBe(true);
  });
});
