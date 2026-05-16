import { describe, it, expect } from "vitest";
import { createPageLeaveBlocker, createPageVisibility, usePageVisibility } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  it("createPageVisibility() - SSR", () => {
    const visible = createPageVisibility();
    expect(visible).toBeInstanceOf(Function);
    expect(visible()).toBe(true);
  });

  it("usePageVisibility() - SSR", () => {
    const visible = usePageVisibility();
    expect(visible).toBeInstanceOf(Function);
    expect(visible()).toBe(true);
  });

  it("createPageLeaveBlocker() - SSR", () => {
    expect(() => createPageLeaveBlocker()).not.toThrow();
    expect(() => createPageLeaveBlocker(false)).not.toThrow();
  });
});
