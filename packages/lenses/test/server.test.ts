import { describe, expect, test } from "vitest";
import { createLens } from "../src";

describe("createLens", () => {
  test("doesn't break in SSR", () => {
    expect(createLens).toBeDefined();
  });
});
