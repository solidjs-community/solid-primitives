import { describe, test, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createIsMounted, isHydrated } from "../src";

describe("createIsMounted", () => {
  test("createIsMounted", () => {
    createRoot(dispose => {
      const isMounted = createIsMounted();
      expect(isMounted()).toBe(false);

      createEffect(() => {
        expect(isMounted()).toBe(true);
        dispose();
      });
    });

    expect(createIsMounted()()).toBe(true);
  });
});

describe("isHydrated", () => {
  test("isHydrated", () => {
    expect(isHydrated()).toBe(true);
  });
});
