import { createEffect, createRoot, flush } from "solid-js";
import { describe, test, expect } from "vitest";
import { createURL, createURLRecord } from "../src/index.js";

const inithref = "http://example.com/path?foo=bar#hash";

describe("ReactiveURL", () => {
  test("behaves like a URL instance", () =>
    createRoot(dispose => {
      const native = new URL(inithref);
      const url = createURL(inithref);

      expect(url.href).toBe(native.href);
      expect(url.pathname).toBe(native.pathname);
      expect(url.search).toBe(native.search);
      expect(url.hash).toBe(native.hash);
      expect(url.origin).toBe(native.origin);
      expect(url.toString()).toBe(native.toString());
      expect(url.toJSON()).toBe(native.toJSON());

      dispose();
    }));

  test("setters update every derived field", () =>
    createRoot(dispose => {
      const url = createURL(inithref);

      url.pathname = "/other";
      expect(url.pathname).toBe("/other");
      expect(url.href).toBe("http://example.com/other?foo=bar#hash");

      url.search = "?baz=qux";
      expect(url.search).toBe("?baz=qux");
      expect(url.href).toBe("http://example.com/other?baz=qux#hash");

      dispose();
    }));

  test("is reactive — updates trigger effects", () =>
    createRoot(dispose => {
      const url = createURL(inithref);
      let hrefUpdates = 0;
      let hashUpdates = 0;

      createEffect(
        () => url.href,
        () => {
          hrefUpdates++;
        },
        { defer: true },
      );
      createEffect(
        () => url.hash,
        () => {
          hashUpdates++;
        },
        { defer: true },
      );

      url.search = "?a=1";
      flush();
      expect(hrefUpdates, "href changed").toBe(1);
      expect(hashUpdates, "hash did not change").toBe(0);

      dispose();
    }));

  test("origin cannot be reassigned through the record setter", () =>
    createRoot(dispose => {
      const [state, setURL] = createURLRecord(inithref);
      // @ts-expect-error origin is read-only
      setURL({ origin: "http://evil.com", pathname: "/safe" });
      expect(state.origin).toBe("http://example.com");
      expect(state.pathname).toBe("/safe");
      dispose();
    }));

  describe("searchParams", () => {
    test("reflects the current search string, and stays referentially stable", () =>
      createRoot(dispose => {
        const url = createURL(inithref);
        const { searchParams } = url;

        expect(searchParams.get("foo")).toBe("bar");
        expect(url.searchParams).toBe(searchParams);

        dispose();
      }));

    test("mutating searchParams updates url.search", () =>
      createRoot(dispose => {
        const url = createURL(inithref);

        url.searchParams.set("foo", "baz");
        expect(url.search).toBe("?foo=baz");

        url.searchParams.append("extra", "1");
        expect(url.search).toBe("?foo=baz&extra=1");

        dispose();
      }));

    test("writing url.search updates searchParams", () =>
      createRoot(dispose => {
        const url = createURL(inithref);
        const { searchParams } = url;

        url.search = "?a=1&b=2";
        flush();

        expect(searchParams.get("a")).toBe("1");
        expect(searchParams.get("b")).toBe("2");
        expect(searchParams.has("foo")).toBe(false);

        dispose();
      }));

    test("preserves repeated keys when re-synced from url.search", () =>
      createRoot(dispose => {
        const url = createURL(inithref);
        const { searchParams } = url;

        url.search = "?tag=a&tag=b";
        flush();

        expect(searchParams.getAll("tag")).toEqual(["a", "b"]);

        dispose();
      }));

    test("sorting searchParams updates url.search and href", () =>
      createRoot(dispose => {
        const url = createURL("http://example.com/path?b=2&a=1");

        url.searchParams.sort();

        expect(url.search).toBe("?a=1&b=2");
        expect(url.href).toBe("http://example.com/path?a=1&b=2");

        dispose();
      }));
  });
});
