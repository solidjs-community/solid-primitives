import { describe, expect, it, vi } from "vitest";
import { createElementBounds } from "../src/index.js";

describe("createElementBounds", () => {
  it("is a noop on the server", () => {
    const el = vi.fn();
    const bounds = createElementBounds(el);
    expect(bounds).toEqual({
      top: null,
      left: null,
      bottom: null,
      right: null,
      width: null,
      height: null,
    });
    expect(el).not.toBeCalled();
  });
});
