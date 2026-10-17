import { describe, test, expect, vi } from "vitest";
import { createResizeObserver, createElementSize, createWindowSize } from "../src/index.js";
import { renderToString } from "@solidjs/web";

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
    expect(size.clientWidth).toBe(null);
    expect(size.clientHeight).toBe(null);
  });

  test("createWindowSize", () => {
    const size = createWindowSize();
    expect(size.width).toBe(0);
    expect(size.height).toBe(0);
  });

  test("createElementSize does not read targets or construct observers during SSR", () => {
    const observer = vi.fn(() => {
      throw new Error("ResizeObserver must not be constructed on the server");
    });
    vi.stubGlobal("ResizeObserver", observer);
    const accessor = vi.fn((): Element => {
      throw new Error("The target accessor must not run on the server");
    });
    const element = {
      getBoundingClientRect() {
        throw new Error("The element must not be measured on the server");
      },
    } as unknown as Element;
    try {
      renderToString(() => {
        for (const size of [createElementSize(accessor), createElementSize(element)]) {
          expect(size).toEqual({
            width: null,
            height: null,
            clientWidth: null,
            clientHeight: null,
          });
        }
        return "server-safe";
      });
      expect(accessor).not.toHaveBeenCalled();
      expect(observer).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
