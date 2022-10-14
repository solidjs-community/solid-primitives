import {
  makeIntersectionObserver,
  createIntersectionObserver,
  createViewportObserver,
  createVisibilityObserver
} from "../src";
import { describe, test, expect, vi } from "vitest";

describe("API works in SSR", () => {
  test("makeIntersectionObserver() - SSR", () => {
    expect(() => makeIntersectionObserver([], () => {})).not.toThrow();
  });

  test("createIntersectionObserver() - SSR", () => {
    const el = vi.fn(() => []);
    const cb = vi.fn(() => {});
    expect(() => createIntersectionObserver(el, cb)).not.toThrow();
    expect(el).not.toBeCalled();
    expect(cb).not.toBeCalled();
  });

  test("createViewportObserver() - SSR", () => {
    expect(() => createViewportObserver()).not.toThrow();
  });

  test("createVisibilityObserver() - SSR", () => {
    expect(() => createVisibilityObserver()).not.toThrow();
  });
});
