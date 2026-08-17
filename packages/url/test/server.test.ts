import { getRequestEvent } from "@solidjs/web";
import { createRoot } from "solid-js";
import { describe, it, expect, vi } from "vitest";
import {
  createLocationState,
  createURL,
  createSearchParams,
  setLocationFallback,
} from "../src/index.js";

vi.mock("@solidjs/web", async importOriginal => ({
  ...(await importOriginal<typeof import("@solidjs/web")>()),
  getRequestEvent: vi.fn(),
}));

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

  it("createLocationState derives its fallback from getRequestEvent, taking priority over the global fallback", () =>
    createRoot(dispose => {
      setLocationFallback("http://example.com/global-fallback");
      vi.mocked(getRequestEvent).mockReturnValueOnce({
        request: new Request("http://example.com/from-request-event"),
        locals: {},
      });
      const [state] = createLocationState();
      expect(state.pathname).toBe("/from-request-event");
      dispose();
    }));

  it("an explicit fallback argument takes priority over getRequestEvent", () =>
    createRoot(dispose => {
      vi.mocked(getRequestEvent).mockReturnValueOnce({
        request: new Request("http://example.com/from-request-event"),
        locals: {},
      });
      const [state] = createLocationState("http://example.com/explicit-fallback");
      expect(state.pathname).toBe("/explicit-fallback");
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
