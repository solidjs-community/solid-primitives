import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import {
  createAutofocus,
  createFocusTrap,
  createFocusGroup,
  makePressKeepsFocus,
  createPressKeepsFocus,
  makeRovingScope,
  createRovingScope,
} from "../src/index.js";

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

  it("createFocusGroup() - SSR", () => {
    createRoot(dispose => {
      expect(() => createFocusGroup(() => undefined)).not.toThrow();
      dispose();
    });
  });
});

describe("press keeps focus & roving scope - SSR", () => {
  it("makePressKeepsFocus / createPressKeepsFocus are no-ops", () => {
    createRoot(dispose => {
      expect(makePressKeepsFocus(null as any)()).toBeUndefined();
      const ref = createPressKeepsFocus();
      expect(() => ref(null as any)).not.toThrow();
      dispose();
    });
  });

  it("makeRovingScope returns an inert scope", () => {
    const scope = makeRovingScope(null as any, { selector: "button" });
    expect(scope.active()).toBeUndefined();
    expect(scope.items()).toEqual([]);
    expect(scope.focusNext()).toBeUndefined();
    expect(scope.setActive(null as any)).toBe(false);
    expect(() => (scope.refresh(), scope.dispose())).not.toThrow();
  });

  it("createRovingScope returns inert scope without touching the DOM", () => {
    createRoot(dispose => {
      const scope = createRovingScope(() => undefined);
      expect(scope.active()).toBeUndefined();
      expect(scope.focusFirst()).toBeUndefined();
      expect(scope.items()).toEqual([]);
      dispose();
    });
  });
});
