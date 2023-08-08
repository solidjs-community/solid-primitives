import { describe, it, expect } from "vitest";
import { createMediaQuery } from "../src/index.js";

describe("createMediaQuery", () => {
  it("should return false on the server", () => {
    expect(createMediaQuery("(max-width: 767px)")()).toBe(false);
  });

  it("can override the server fallback", () => {
    expect(createMediaQuery("(max-width: 767px)", true)()).toBe(true);
  });
});
