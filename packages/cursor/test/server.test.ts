import { describe, it, expect, vi } from "vitest";
import { createBodyCursor, createElementCursor } from "../src";

describe("createBodyCursor", () => {
  it("works in ssr", () => {
    const cb = vi.fn();
    createBodyCursor(cb);
    expect(cb).not.toBeCalled();
  });
});

describe("createElementCursor", () => {
  it("works in ssr", () => {
    const el = vi.fn();
    const cb = vi.fn();
    createElementCursor(el, cb);
    expect(cb).not.toBeCalled();
    expect(el).not.toBeCalled();
  });
});
