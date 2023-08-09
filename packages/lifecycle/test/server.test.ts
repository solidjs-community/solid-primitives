import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createIsMounted, isHydrated } from "../src/index.js";
import { renderToString } from "solid-js/web";

describe("createIsMounted", () => {
  test("createIsMounted", () => {
    createRoot(dispose => {
      const isMounted = createIsMounted();
      expect(isMounted()).toBe(false);
      dispose();
    });

    expect(createIsMounted()()).toBe(false);
  });
});

describe("isHydrated", () => {
  test("isHydrated", () => {
    expect(isHydrated()).toBe(false);

    createRoot(dispose => {
      expect(isHydrated()).toBe(false);
      dispose();
    });

    renderToString(() => {
      expect(isHydrated()).toBe(false);
      return "";
    });
  });
});
