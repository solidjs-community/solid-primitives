import { describe, test, expect } from "vitest";
import { limitPath } from "../src";

describe("limitPath", () => {
  test("do not change path for empty base path", () => {
    expect(limitPath("")("/test")).toBe("/test");
    expect(limitPath("/")("/test")).toBe("/test");
  });

  test("add base path", () => {
    expect(limitPath("/package/")("/test")).toBe("/package/test");
  });

  test("throws error if path is not starting with root path", () => {
    expect(limitPath("/root/")("../root/extra")).toBe("/root/extra");
    expect(() => limitPath("/root/")("../other/path")).toThrow(
      "cannot go below base path: ../other/path",
    );
  });

  test("throws error when going below root", () => {
    expect(() => limitPath("/root/")("../../..")).toThrow("cannot go below root path: ../../..");
  });
});
