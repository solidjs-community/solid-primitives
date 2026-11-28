import { createClipboard, createCopyToClipboard } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("API doesn't break in SSR", () => {
  it("createClipboard() - SSR", () => {
    const [clipboard, refetch, modify] = createClipboard();
    expect(clipboard()).toEqual([]);
    expect(refetch).toBeInstanceOf(Function);
    expect(modify).toBeInstanceOf(Function);
  });

  it("createCopyToClipboard() - SSR", async () => {
    const c = createCopyToClipboard();
    expect(c.status()).toBe("idle");
    expect(c.copied()).toBe(false);
    expect(c.error()).toBeUndefined();
    expect(await c.copy("x")).toBe(false);
    expect(c.status()).toBe("idle");
    expect(() => c.reset()).not.toThrow();
  });
});
