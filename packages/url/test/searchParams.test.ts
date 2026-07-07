import { createEffect, createRoot, flush } from "solid-js";
import { describe, test, expect, afterEach } from "vitest";
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
  test("behaves like URLSearchParams", () => {
    const params = createSearchParams("foo=1&foo=2&bar=baz");
    expect(params).toBeInstanceOf(URLSearchParams);
    expect(params.get("foo")).toBe("1");
    expect(params.getAll("foo")).toEqual(["1", "2"]);
    expect(params.toString()).toBe("foo=1&foo=2&bar=baz");
  });

  test("is granularly reactive per key", () =>
    createRoot(dispose => {
      const params = new ReactiveSearchParams("foo=1&bar=2");
      let fooUpdates = 0;
      let barUpdates = 0;

      createEffect(
        () => params.get("foo"),
        () => {
          fooUpdates++;
        },
        { defer: true },
      );
      createEffect(
        () => params.get("bar"),
        () => {
          barUpdates++;
        },
        { defer: true },
      );

      params.set("foo", "9");
      flush();
      expect(fooUpdates, "foo changed").toBe(1);
      expect(barUpdates, "bar did not change").toBe(0);

      dispose();
    }));

  test("set() is a no-op when the value doesn't change", () =>
    createRoot(dispose => {
      const params = new ReactiveSearchParams("foo=1");
      let updates = 0;

      createEffect(
        () => params.get("foo"),
        () => {
          updates++;
        },
        { defer: true },
      );

      params.set("foo", "1");
      flush();
      expect(updates).toBe(0);

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
