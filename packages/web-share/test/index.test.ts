import { describe, test, expect, it } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createWebShare } from "../src";

describe("createWebShare", () => {
  test("createWebShare initial values", () =>
    createRoot(async dispose => {
      const [data] = createSignal<ShareData>({});
      const status = createWebShare(data);

      expect(status.status, "Test starting status should be undefined.").toBe(undefined);
      expect(status.message, "Test starting message should be undefined.").toBe(undefined);

      dispose();
    }));

  // todo: Asynchronous test.
  it.todo("Asynchronous test to change data.");
});
