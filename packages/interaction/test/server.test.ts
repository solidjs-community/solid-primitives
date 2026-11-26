import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createInertOthers, createInteractOutside, makeInertOthers } from "../src/index.js";

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
      createInteractOutside({ shouldExcludeElement: () => true }, () => undefined);
    }).not.toThrow();
  });
});

describe("inert on server", () => {
  it("makeInertOthers returns a no-op cleanup", () => {
    const cleanup = makeInertOthers({} as any);
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
    expect(() => makeInertOthers(undefined, { strategy: "both" })()).not.toThrow();
  });

  it("createInertOthers does nothing", () => {
    expect(() =>
      createRoot(dispose => {
        createInertOthers(() => undefined, true, { strategy: "inert" });
        dispose();
      }),
    ).not.toThrow();
  });
});
