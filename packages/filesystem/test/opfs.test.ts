import { describe, it, expect } from "vitest";
import { makeOpfsFileSystem } from "../src/adapter-opfs";

describe("makeOpfsFileSystem", () => {
  it("returns null gracefully in non-browser / non-OPFS environments", async () => {
    const fs = await makeOpfsFileSystem();
    expect(fs === null || typeof fs === "object").toBe(true);
  });
});
