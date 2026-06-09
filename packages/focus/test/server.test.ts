import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createAutofocus, createFocusTrap } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  it("createAutofocus() - SSR", () => {
    createRoot(dispose => {
      expect(() => createAutofocus(() => null)).not.toThrow();
      dispose();
    });
  });

  it("createFocusTrap() - SSR", () => {
    createRoot(dispose => {
      expect(() => createFocusTrap({ element: null })).not.toThrow();
      dispose();
    });
  });
});
