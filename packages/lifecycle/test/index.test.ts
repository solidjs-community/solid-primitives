import { describe, test, expect } from "vitest";
import { createRoot, flush } from "solid-js";
import { createIsMounted, isHydrated } from "../src/index.js";

describe("createIsMounted", () => {
  test("createIsMounted", () => {
    let isMounted!: () => boolean;
    const dispose = createRoot(d => {
      isMounted = createIsMounted();
      expect(isMounted()).toBe(false);
      return d;
    });

    flush();
    expect(isMounted()).toBe(true);
    dispose();
  });
});

describe("isHydrated", () => {
  test("isHydrated", () => {
    expect(isHydrated()).toBe(true);
  });
});
