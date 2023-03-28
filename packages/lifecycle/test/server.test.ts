import { describe, test, expect } from "vitest";
import { createRoot, sharedConfig } from "solid-js";
import { createIsMounted, isHydrated, isHydrating } from "../src";
import { NoHydration, renderToString } from "solid-js/web";

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

describe("isHydrating", () => {
  test("isHydrating", () => {
    expect(isHydrated()).toBe(false);

    createRoot(dispose => {
      expect(isHydrated()).toBe(false);
      dispose();
    });

    renderToString(() => {
      expect(isHydrating()).toBe(true);
      console.log(sharedConfig.context);
      NoHydration({
        get children() {
          console.log(sharedConfig.context);
          expect(isHydrating()).toBe(false);
          return "";
        },
      });
      return "";
    });
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
