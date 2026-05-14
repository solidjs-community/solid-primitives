import { describe, expect, it } from "vitest";
import {
  createPointerList,
  createPointerListeners,
  createPointerPosition,
  createPerPointerListeners,
} from "../src/index.js";

describe("API doesn't break in SSR", () => {
  it("createPointerListeners() - SSR", () => {
    expect(() => createPointerListeners({ onMove: () => void 0 })).not.toThrow();
  });

  it("createPerPointerListeners() - SSR", () => {
    expect(() => createPerPointerListeners({ onDown: () => void 0 })).not.toThrow();
  });

  it("createPointerPosition() - SSR", () => {
    const position = createPointerPosition();
    expect(position).toBeInstanceOf(Function);
    expect(position().isActive).toBe(false);
    expect(position().x).toBe(0);
    expect(position().y).toBe(0);
  });

  it("createPointerList() - SSR", () => {
    const list = createPointerList();
    expect(list).toBeInstanceOf(Function);
    expect(list()).toEqual([]);
  });
});
