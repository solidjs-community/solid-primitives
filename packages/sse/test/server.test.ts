import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createSSE, createSSEStream } from "../src/index.js";

describe("SSR", () => {
  it("returns safe stubs without touching EventSource", () =>
    createRoot(dispose => {
      const sse = createSSE("https://example.com/events");
      expect(sse.source()).toBeUndefined();
      expect(() => sse.data()).toThrow(); // throws NotReadyError — no initialValue
      expect(sse.readyState()).toBe(2);
      expect(() => sse.close()).not.toThrow();
      expect(() => sse.reconnect()).not.toThrow();
      dispose();
    }));

  it("exposes initialValue in SSR data stub", () =>
    createRoot(dispose => {
      const { data } = createSSE("https://example.com/events", {
        initialValue: "loading",
      });
      expect(data()).toBe("loading");
      dispose();
    }));

  it("createSSEStream throws NotReadyError on server", () =>
    createRoot(dispose => {
      const data = createSSEStream("https://example.com/events");
      expect(() => data()).toThrow();
      dispose();
    }));
});
