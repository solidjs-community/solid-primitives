import { describe, test, expect } from "vitest";
import { createFullscreen } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  // check if the API doesn't throw when calling it in SSR
  test("createFullScreen() - SSR", () => {
    expect(createFullscreen(undefined, () => false)()).toEqual(false);
  });
});
