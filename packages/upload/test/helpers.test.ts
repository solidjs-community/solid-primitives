import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { transformFiles } from "../src/helpers.js";

describe("transformFiles", () => {
  beforeEach(() => {
    // jsdom has no createObjectURL; browsers throw for anything that isn't a Blob
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: (blob: unknown) => {
        if (!(blob instanceof Blob)) throw new TypeError("not a Blob");
        return "blob:test";
      },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an empty array for null", () => {
    expect(transformFiles(null)).toEqual([]);
  });

  it("handles an empty FileList", () => {
    const input = document.createElement("input");
    input.type = "file";
    // a real FileList: `for...in` over it also visits `item` and `length`
    expect(transformFiles(input.files)).toEqual([]);
  });

  it("maps every file, ignoring the FileList's own members", () => {
    const a = new File(["a"], "a.txt");
    const b = new File(["bb"], "b.txt");
    // jsdom can't build a populated FileList; mimic its shape, including `length` and `item`
    const files = {
      0: a,
      1: b,
      length: 2,
      item: (i: number) => [a, b][i] ?? null,
      *[Symbol.iterator]() {
        yield a;
        yield b;
      },
    } as unknown as FileList;

    expect(transformFiles(files)).toEqual([
      { source: "blob:test", name: "a.txt", size: 1, file: a },
      { source: "blob:test", name: "b.txt", size: 2, file: b },
    ]);
  });
});
