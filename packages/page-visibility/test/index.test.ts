import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createPageVisibility } from "../src";

describe("createPageVisibility", () => {
  it("observes visibilitychange events", () =>
    createRoot(dispose => {
      let doc_visibility = "prerender";
      Object.defineProperty(document, "visibilityState", {
        get() {
          return doc_visibility;
        }
      });

      const visibility = createPageVisibility();
      expect(visibility()).toBe(false);

      doc_visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
      expect(visibility()).toBe(true);

      doc_visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
      expect(visibility()).toBe(false);

      dispose();

      doc_visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
      expect(visibility()).toBe(false);
    }));
});
