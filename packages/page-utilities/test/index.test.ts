import { describe, expect, it } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { createPageLeaveBlocker, createPageVisibility, makePageLeave } from "../src/index.js";
import { INTERNAL_OPTIONS } from "@solid-primitives/utils";

const beforeunload = () => new Event("beforeunload", { cancelable: true });

describe("createPageVisibility", () => {
  it("observes visibilitychange events", () =>
    createRoot(dispose => {
      let doc_visibility = "prerender";
      Object.defineProperty(document, "visibilityState", {
        get() {
          return doc_visibility;
        },
      });

      const visibility = createPageVisibility();
      expect(visibility()).toBe(false);

      doc_visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
      flush();
      expect(visibility()).toBe(true);

      doc_visibility = "hidden";
      document.dispatchEvent(new Event("visibilitychange"));
      flush();
      expect(visibility()).toBe(false);

      dispose();

      doc_visibility = "visible";
      document.dispatchEvent(new Event("visibilitychange"));
      expect(visibility()).toBe(false);
    }));
});

describe("makePageLeave", () => {
  it("prevents navigation and cleans up manually", () => {
    const cleanup = makePageLeave();

    const e1 = beforeunload();
    window.dispatchEvent(e1);
    expect(e1.defaultPrevented).toBe(true);

    cleanup();

    const e2 = beforeunload();
    window.dispatchEvent(e2);
    expect(e2.defaultPrevented).toBe(false);
  });
});

describe("createPageLeaveBlocker", () => {
  it("prevents navigation by default", () =>
    createRoot(dispose => {
      createPageLeaveBlocker();

      const e = beforeunload();
      window.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(true);

      dispose();

      const e2 = beforeunload();
      window.dispatchEvent(e2);
      expect(e2.defaultPrevented).toBe(false);
    }));

  it("does nothing when passed false", () =>
    createRoot(dispose => {
      createPageLeaveBlocker(false);

      const e = beforeunload();
      window.dispatchEvent(e);
      expect(e.defaultPrevented).toBe(false);

      dispose();
    }));

  it("toggles with a reactive signal", () =>
    createRoot(dispose => {
      const [enabled, setEnabled] = createSignal(true, INTERNAL_OPTIONS);
      createPageLeaveBlocker(enabled);
      flush();

      const e1 = beforeunload();
      window.dispatchEvent(e1);
      expect(e1.defaultPrevented).toBe(true);

      setEnabled(false);
      flush();

      const e2 = beforeunload();
      window.dispatchEvent(e2);
      expect(e2.defaultPrevented).toBe(false);

      setEnabled(true);
      flush();

      const e3 = beforeunload();
      window.dispatchEvent(e3);
      expect(e3.defaultPrevented).toBe(true);

      dispose();
    }));
});
