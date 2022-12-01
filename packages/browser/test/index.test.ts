import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createWebShare } from "../src";

describe("createWebShare", () => {
  test("createWebShare return values", () =>
    createRoot(dispose => {
      const status = createWebShare({text: "text"});
      expect(status(), "Test status should be rejected.").toBe("rejected");
      dispose();
    }));
});
