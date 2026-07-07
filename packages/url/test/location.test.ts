import { createRoot } from "solid-js";
import { describe, test, expect, afterEach } from "vitest";
import { createLocationState, updateLocation } from "../src/index.js";

const origin = location.origin;

describe("createLocationState", () => {
  afterEach(() => {
    history.replaceState(null, "", origin + "/");
  });

  test("reflects the current window.location", () =>
    createRoot(dispose => {
      const [state] = createLocationState();
      expect(state.pathname).toBe("/");
      expect(state.href).toBe(origin + "/");
      dispose();
    }));

  test("updates when history.pushState is called directly", () =>
    createRoot(dispose => {
      const [state] = createLocationState();
      history.pushState(null, "", "/foo?bar=1");
      expect(state.pathname).toBe("/foo");
      expect(state.search).toBe("?bar=1");
      dispose();
    }));

  test("updates when history.replaceState is called directly", () =>
    createRoot(dispose => {
      const [state] = createLocationState();
      history.replaceState(null, "", "/replaced-directly");
      expect(state.pathname).toBe("/replaced-directly");
      dispose();
    }));

  test("updates on popstate", () =>
    createRoot(dispose => {
      const [state] = createLocationState();
      history.pushState(null, "", "/after-pop");
      window.dispatchEvent(new Event("popstate"));
      expect(state.pathname).toBe("/after-pop");
      dispose();
    }));

  test("push/replace setters update the location", () =>
    createRoot(dispose => {
      const [state, { push, replace }] = createLocationState();

      push({ pathname: "/push-test" });
      expect(state.pathname).toBe("/push-test");

      replace({ pathname: "/replace-test" });
      expect(state.pathname).toBe("/replace-test");

      dispose();
    }));

  test("supports the (key, value) setter overload", () =>
    createRoot(dispose => {
      const [state, { push }] = createLocationState();
      push("hash", "heading1");
      expect(state.hash).toBe("#heading1");
      dispose();
    }));

  test("supports an updater function", () =>
    createRoot(dispose => {
      const [state, { push }] = createLocationState();
      push(prev => ({ pathname: prev.pathname + "nested" }));
      expect(state.pathname).toBe("/nested");
      dispose();
    }));

  test("origin cannot be overwritten", () =>
    createRoot(dispose => {
      const [state, { push }] = createLocationState();
      // @ts-expect-error origin is read-only
      push({ origin: "http://evil.com", pathname: "/safe" });
      expect(state.origin).toBe(origin);
      expect(state.pathname).toBe("/safe");
      dispose();
    }));
});

describe("updateLocation", () => {
  afterEach(() => {
    history.replaceState(null, "", origin + "/");
  });

  test("push uses history.pushState", () => {
    const before = history.length;
    updateLocation(origin + "/pushed", "push");
    expect(location.pathname).toBe("/pushed");
    expect(history.length).toBe(before + 1);
  });

  test("replace uses history.replaceState", () => {
    updateLocation(origin + "/before-replace", "push");
    const before = history.length;
    updateLocation(origin + "/replaced", "replace");
    expect(location.pathname).toBe("/replaced");
    expect(history.length).toBe(before);
  });
});
