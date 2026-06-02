import { describe, test, expect, vi } from "vitest";
import { createRoot, flush } from "solid-js";
import { createWebShare, createSocialShare } from "../src/index.js";

describe("createWebShare", () => {
  test("initial values", () =>
    createRoot(dispose => {
      const { pending, status, message } = createWebShare();

      expect(pending()).toBe(false);
      expect(status()).toBe(undefined);
      expect(message()).toBe(undefined);

      dispose();
    }));

  test("share resolves and sets success status", async () => {
    await createRoot(async dispose => {
      Object.defineProperty(navigator, "share", {
        value: vi.fn().mockResolvedValue(undefined),
        configurable: true,
      });

      const { share, pending, status, message } = createWebShare();

      const promise = share({ url: "https://solidjs.com" });
      flush();
      expect(pending()).toBe(true);

      await promise;
      flush();
      expect(pending()).toBe(false);
      expect(status()).toBe(true);
      expect(message()).toBe(undefined);

      dispose();
    });
  });

  test("share sets failure status on rejection", async () => {
    await createRoot(async dispose => {
      Object.defineProperty(navigator, "share", {
        value: vi.fn().mockRejectedValue("share failed"),
        configurable: true,
      });

      const { share, pending, status, message } = createWebShare();

      await share({ url: "https://solidjs.com" });
      flush();
      expect(pending()).toBe(false);
      expect(status()).toBe(false);
      expect(message()).toBe("share failed");

      dispose();
    });
  });
});

describe("createSocialShare", () => {
  test("initial values", () =>
    createRoot(dispose => {
      const { share, close, isSharing } = createSocialShare(
        () => ({ url: "https://solidjs.com", title: "SolidJS", description: "A reactive library" }),
      );

      expect(typeof share).toBe("function");
      expect(typeof close).toBe("function");
      expect(isSharing()).toBe(false);

      dispose();
    }));
});
