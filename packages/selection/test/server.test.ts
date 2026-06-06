import { describe, it, expect } from "vitest";
import { createSelection } from "../src/index.js";

describe("createSelection (server)", () => {
  it("returns no-op accessor and setter", () => {
    const [selection, setSelection] = createSelection();
    expect(selection()).toEqual([null, NaN, NaN]);
    setSelection([null, 1, 2]);
    expect(selection()).toEqual([null, NaN, NaN]);
  });
});
