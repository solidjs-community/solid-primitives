import { describe, it, assert, expect, beforeAll } from "vitest";
import { createLocationState } from "../src";
import { createComputed, createRoot, createSignal, on } from "solid-js";

const getFallback = () => ({
  hash: "",
  host: "example.com",
  hostname: "example.com",
  href: "http://example.com/",
  origin: "http://example.com",
  pathname: "/",
  port: "",
  protocol: "http:",
  search: ""
});

describe("createLocationState", () => {
  beforeAll(() => {
    // @ts-expect-error
    globalThis.location = getFallback();
  });

  it("returns location fallback", () =>
    createRoot(dispose => {
      const [state] = createLocationState();
      expect(state).toEqual(getFallback());
      dispose();
    }));
});
