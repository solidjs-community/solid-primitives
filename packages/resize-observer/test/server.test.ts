import { describe, test, expect, vi } from "vitest";
import { createResizeObserver, createElementSize, createWindowSize } from "../src";

describe("server", () => {
  test("createResizeObserver", () => {
    const el = vi.fn();
    const cb = vi.fn();
    createResizeObserver(el, cb);
    expect(cb).not.toBeCalled();
    expect(el).not.toBeCalled();
  });

  test("createElementSize", () => {
    const el = vi.fn(() => false as false);
    const size = createElementSize(el);
    expect(el).not.toBeCalled();
    expect(size.width).toBe(null);
    expect(size.height).toBe(null);
  });

  test("createWindowSize", () => {
    const size = createWindowSize();
    expect(size.width).toBe(0);
    expect(size.height).toBe(0);
  });
});
