import { describe, test, expect } from "vitest";
import { createPermission } from "../src/index.js";

describe("createPermission", () => {
  test("doesn't break in SSR", () => {
    expect(createPermission("camera")()).toBe("unknown");
  });
});
