import { describe, expect, test } from "vitest";
import { createRoot } from "solid-js";
import { createInertOthers, makeInertOthers } from "../src/index.js";

describe("inert — SSR", () => {
  test("makeInertOthers returns a no-op cleanup", () => {
    const cleanup = makeInertOthers({} as any);
    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
    expect(() => makeInertOthers(undefined, { strategy: "both" })()).not.toThrow();
  });

  test("createInertOthers does nothing on the server", () => {
    expect(() =>
      createRoot(dispose => {
        createInertOthers(() => undefined, true, { strategy: "inert" });
        dispose();
      }),
    ).not.toThrow();
  });
});
