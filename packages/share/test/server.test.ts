import { createRoot } from "solid-js";
import { describe, test, expect } from "vitest";
import { createWebShare, createSocialShare } from "../src/index.js";

describe("createWebShare", () => {
  test("doesn't break in SSR", () => {
    createRoot(dispose => {
      const { share, pending, status, message } = createWebShare();

      expect(typeof share).toBe("function");
      expect(pending()).toBe(false);
      expect(status()).toBe(undefined);
      expect(message()).toBe(undefined);

      dispose();
    });
  });
});

describe("createSocialShare", () => {
  test("doesn't break in SSR", () => {
    createRoot(dispose => {
      const { share, close, isSharing } = createSocialShare(
        () => ({ url: "https://solidjs.com", title: "SolidJS", description: "A reactive library" }),
      );

      expect(typeof share).toBe("function");
      expect(typeof close).toBe("function");
      expect(isSharing()).toBe(false);

      dispose();
    });
  });
});
