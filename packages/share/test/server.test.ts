import { createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
import { createWebShare } from "../src/index.js";

describe("createWebShare", () => {
  test("doesn't break in SSR", () => {
    createRoot(dispose => {
      const [data] = createSignal<ShareData>({});
      const status = createWebShare(data);

      expect(status.status, "Server test starting status should be undefined.").toBe(undefined);
      expect(status.message, "Server test starting message should be undefined.").toBe(undefined);

      dispose();
    });
  });
});
