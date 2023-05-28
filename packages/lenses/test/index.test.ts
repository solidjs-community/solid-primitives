import { createRoot } from "solid-js";
import { describe, expect, test } from "vitest";
import { createLens } from "../src";

describe("createLens (server)", () => {
  test("is defined", () =>
    createRoot(dispose => {
      expect(createLens).toBeDefined();
      dispose();
    }));
});
