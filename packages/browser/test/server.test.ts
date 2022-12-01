import { describe, test, expect } from "vitest";
import { createWebShare } from "../src";

describe("createWebShare", () => {
  test("doesn't break in SSR", () => {
    const status = createWebShare({});
    expect(status(), "initial value should be pending").toBe("pending");
  });
});
