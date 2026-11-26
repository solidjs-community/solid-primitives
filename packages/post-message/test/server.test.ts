import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createPostMessage } from "../src/index.js";

describe("createPostMessage — SSR", () => {
  it("returns inert stubs", () => {
    createRoot(dispose => {
      const ch = createPostMessage<string>({
        target: () => undefined,
        allowedOrigins: ["https://a.test"],
        targetOrigin: "https://a.test",
      });
      expect(ch.message()).toBeUndefined();
      expect(ch.send("x")).toBe(false);
      const off = ch.onMessage(() => {});
      expect(typeof off).toBe("function");
      off();
      ch.close();
      dispose();
    });
  });
});
