import { describe, test, expect } from "vitest";
import { createAccelerometer, createGyroscope } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  test("createAccelerometer() - SSR", () => {
    expect(createAccelerometer()()).toEqual({ x: 0, y: 0, z: 0 });
  });

  test("createGyroscope() - SSR", () => {
    expect(createGyroscope()).toEqual({ alpha: 0, beta: 0, gamma: 0 });
  });
});
