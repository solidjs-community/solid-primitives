import {
  makeIntersectionObserver,
  createIntersectionObserver,
  createViewportObserver,
  createVisibilityObserver,
} from "../src/index.js";
import { describe, test, expect, vi } from "vitest";

describe("API works in SSR", () => {
  test("makeIntersectionObserver() - SSR", () => {
    expect(() => makeIntersectionObserver([], () => {})).not.toThrow();
  });

  test("createIntersectionObserver() - SSR", () => {
    const el = vi.fn(() => []);
    const options = vi.fn(() => ({}));
    expect(() => createIntersectionObserver(el, options)).not.toThrow();
    // elements accessor and options accessor are not called on the server
    expect(el).not.toBeCalled();
    expect(options).not.toBeCalled();
  });

  test("createIntersectionObserver() - SSR returns tuple with throwing isVisible", () => {
    const [entries, isVisible] = createIntersectionObserver(() => []);
    expect(entries).toEqual([]);
    expect(() => isVisible({} as Element)).toThrow();
  });

  test("createViewportObserver() - SSR", () => {
    expect(() => createViewportObserver()).not.toThrow();
  });

  test("createVisibilityObserver() - SSR throws before first observation without initialValue", () => {
    const div = {} as Element;
    const isVisible = createVisibilityObserver(div);
    expect(() => isVisible()).toThrow();
  });

  test("createVisibilityObserver() - SSR returns initialValue when provided", () => {
    const div = {} as Element;
    const isVisible = createVisibilityObserver(div, { initialValue: false });
    expect(isVisible()).toBe(false);

    const isVisibleTrue = createVisibilityObserver(div, { initialValue: true });
    expect(isVisibleTrue()).toBe(true);
  });
});
