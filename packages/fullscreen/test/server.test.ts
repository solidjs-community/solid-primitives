import { describe, test, expect } from "vitest";
import { createFullscreen, fullscreen } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  test("createFullscreen() returns safe defaults", async () => {
    const { enter, exit, isActive } = createFullscreen(undefined as any);
    expect(isActive()).toBe(false);
    await expect(enter()).resolves.toBeUndefined();
    await expect(exit()).resolves.toBeUndefined();
  });

  test("fullscreen() returns a no-op ref callback", () => {
    const attach = fullscreen();
    expect(attach).toBeTypeOf("function");
  });
});
