import { describe, test, expect, vi } from "vitest";
import { makeActiveElementListener, createActiveElement } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  test("makeActiveElementListener() - SSR", () => {
    const cb = vi.fn();
    expect(() => makeActiveElementListener(cb)).not.toThrow();
    expect(cb).not.toBeCalled();
  });

  test("createActiveElement() - SSR", () => {
    expect(() => createActiveElement()).not.toThrow();
  });
});
