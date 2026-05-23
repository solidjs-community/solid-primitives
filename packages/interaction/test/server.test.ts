import { describe, it, expect, vi } from "vitest";
import { createInteractOutside } from "../src/index.js";

describe("createInteractOutside on server", () => {
  it("can be called without error", () => {
    expect(() => {
      createInteractOutside({}, () => undefined);
    }).not.toThrow();
  });

  it("returns without setting up listeners (no-op on server)", () => {
    const onFocusOutside = vi.fn();
    const onPointerDownOutside = vi.fn();
    const onInteractOutside = vi.fn();

    createInteractOutside(
      { onFocusOutside, onPointerDownOutside, onInteractOutside },
      () => undefined,
    );

    expect(onFocusOutside).not.toHaveBeenCalled();
    expect(onPointerDownOutside).not.toHaveBeenCalled();
    expect(onInteractOutside).not.toHaveBeenCalled();
  });

  it("does not call onChange when disabled is provided", () => {
    const onInteractOutside = vi.fn();
    createInteractOutside({ disabled: true, onInteractOutside }, () => undefined);
    expect(onInteractOutside).not.toHaveBeenCalled();
  });

  it("accepts a shouldExcludeElement callback without throwing", () => {
    expect(() => {
      createInteractOutside(
        { shouldExcludeElement: () => true },
        () => undefined,
      );
    }).not.toThrow();
  });
});
