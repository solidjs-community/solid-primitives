import { createClipboard } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("API doesn't break in SSR", () => {
  it("createClipboard() - SSR", () => {
    const [clipboard, refetch, modify] = createClipboard();
    expect(clipboard()).toEqual([]);
    expect(refetch).toBeInstanceOf(Function);
    expect(modify).toBeInstanceOf(Function);
  });
});
