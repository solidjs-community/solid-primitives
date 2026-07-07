import { createRoot } from "solid-js";
import { describe, it, expect } from "vitest";
import {
  createLocationState,
  createURL,
  createSearchParams,
  setLocationFallback,
} from "../src/index.js";

describe("SSR", () => {
  it("createLocationState throws without a fallback", () =>
    createRoot(dispose => {
      expect(() => createLocationState()).toThrow();
      dispose();
    }));

  it("createLocationState uses the provided fallback", () =>
    createRoot(dispose => {
      const [state, { push }] = createLocationState("http://example.com/path?foo=bar");
      expect(state.href).toBe("http://example.com/path?foo=bar");
      expect(state.pathname).toBe("/path");
      // setters are no-ops on the server
      expect(() => push({ pathname: "/other" })).not.toThrow();
      dispose();
    }));

  it("createLocationState uses the global fallback set via setLocationFallback", () =>
    createRoot(dispose => {
      setLocationFallback("http://example.com/global-fallback");
      const [state] = createLocationState();
      expect(state.pathname).toBe("/global-fallback");
      dispose();
    }));

  it("createURL / ReactiveURL works without a DOM", () =>
    createRoot(dispose => {
      const url = createURL("http://example.com/path?foo=bar");
      expect(url.pathname).toBe("/path");
      url.pathname = "/other";
      expect(url.href).toBe("http://example.com/other?foo=bar");
      dispose();
    }));

  it("createSearchParams / ReactiveSearchParams works without a DOM", () =>
    createRoot(dispose => {
      const params = createSearchParams("foo=bar");
      expect(params.get("foo")).toBe("bar");
      params.set("foo", "baz");
      expect(params.get("foo")).toBe("baz");
      dispose();
    }));
});
