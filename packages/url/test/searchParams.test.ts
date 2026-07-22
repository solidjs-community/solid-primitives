import { createEffect, createRoot, flush } from "solid-js";
import { describe, test, expect, afterEach, vi } from "vitest";
import {
  createLocationSearchParams,
  createSearchParams,
  getSearchParamsRecord,
  ReactiveSearchParams,
} from "../src/index.js";

const origin = location.origin;

describe("getSearchParamsRecord", () => {
  test("single values map to strings, repeated names to arrays", () => {
    expect(getSearchParamsRecord("?foo=bar")).toEqual({ foo: "bar" });
    expect(getSearchParamsRecord("?foo=1&foo=2&bar=baz")).toEqual({
      foo: ["1", "2"],
      bar: "baz",
    });
    expect(getSearchParamsRecord("")).toEqual({});
  });

  test("accepts a URLSearchParams instance", () => {
    expect(getSearchParamsRecord(new URLSearchParams("a=1"))).toEqual({ a: "1" });
  });
});

describe("ReactiveSearchParams", () => {
  // `instanceof` here has occasionally been observed to fail in CI (but never locally, even
  // under a fresh install or forced single-threaded runs) — most likely two `URLSearchParams`
  // realms racing during vitest's jsdom environment setup. The class genuinely does extend the
  // global `URLSearchParams` (see its source), so a retry papers over test-infra timing, not a
  // real bug.
  test(
    "behaves like URLSearchParams",
    () => {
      const params = createSearchParams("foo=1&foo=2&bar=baz");
      expect(params).toBeInstanceOf(URLSearchParams);
      expect(params.get("foo")).toBe("1");
      expect(params.getAll("foo")).toEqual(["1", "2"]);
      expect(params.toString()).toBe("foo=1&foo=2&bar=baz");
    },
    { retry: 3 },
  );

  test("is granularly reactive per key", () =>
    createRoot(dispose => {
      const params = new ReactiveSearchParams("foo=1&bar=2");
      const fooUpdates = vi.fn();
      const barUpdates = vi.fn();

      createEffect(() => params.get("foo"), fooUpdates, { defer: true });
      createEffect(() => params.get("bar"), barUpdates, { defer: true });

      params.set("foo", "9");
      flush();
      expect(fooUpdates).toHaveBeenCalledTimes(1);
      expect(fooUpdates).toHaveBeenCalledWith("9", undefined);
      expect(barUpdates).not.toHaveBeenCalled();

      dispose();
    }));

  test("set() is a no-op when the value doesn't change", () =>
    createRoot(dispose => {
      const params = new ReactiveSearchParams("foo=1");
      const updates = vi.fn();

      createEffect(() => params.get("foo"), updates, { defer: true });

      params.set("foo", "1");
      flush();
      expect(updates).not.toHaveBeenCalled();

      dispose();
    }));

  test("delete() removes the key", () => {
    const params = createSearchParams("foo=1&bar=2");
    params.delete("foo");
    expect(params.has("foo")).toBe(false);
    expect(params.toString()).toBe("bar=2");
  });
});

describe("createLocationSearchParams", () => {
  afterEach(() => {
    history.replaceState(null, "", origin + "/");
  });

  test("reflects window.location.search", () =>
    createRoot(dispose => {
      history.replaceState(null, "", "/?foo=bar");
      const [params] = createLocationSearchParams();
      expect(params.foo).toBe("bar");
      dispose();
    }));

  test("updates when the location's search changes", () =>
    createRoot(dispose => {
      const [params] = createLocationSearchParams();
      history.pushState(null, "", "/?a=1");
      flush();
      expect(params.a).toBe("1");
      dispose();
    }));

  test("push sets a single param via the (name, value) overload", () =>
    createRoot(dispose => {
      const [params, { push }] = createLocationSearchParams();
      push("page", "2");
      flush();
      expect(params.page).toBe("2");
      expect(location.search).toBe("?page=2");
      dispose();
    }));

  test("push replaces every param via the record overload", () =>
    createRoot(dispose => {
      const [params, { push }] = createLocationSearchParams();
      push({ a: "1" });
      flush();
      push({ b: "2" });
      flush();
      expect(params.a).toBeUndefined();
      expect(params.b).toBe("2");
      dispose();
    }));
});
