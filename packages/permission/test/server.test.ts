import { describe, test, expect } from "vitest";
import { createPermission } from "../src";

describe("createPermission", () => {
  test("doesn't break in SSR", () => {
    expect(createPermission("camera")()).toBe("unknown");
  });
});
