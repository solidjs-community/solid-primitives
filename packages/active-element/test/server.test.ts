/**
 * @vitest-environment node
 */

import { describe, test, expect, vi } from "vitest";
import { makeActiveElementListener, createActiveElement, createFocusSignal } from "../src";

describe("API doesn't break in SSR", () => {
  // check if the API doesn't throw when calling it in SSR
  test("makeActiveElementListener() - SSR", () => {
    const cb = vi.fn();
    expect(() => makeActiveElementListener(cb)).not.toThrow();
    expect(cb).not.toBeCalled();
  });

  test("createActiveElement() - SSR", () => {
    expect(() => createActiveElement()).not.toThrow();
  });

  test("createFocusSignal() - SSR", () => {
    const el = vi.fn();
    expect(() => createFocusSignal(el)).not.toThrow();
    expect(el).not.toBeCalled();
  });
});
