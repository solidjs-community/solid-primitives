import { describe, it, assert, expect } from "vitest";
import { createURL } from "../src";
import { createComputed, createRoot, createSignal, on } from "solid-js";

const inithref = "http://www.domain.com?foo=bar#hash";

describe("ReactiveURL", () => {
  createRoot(dispose => {
    it("behaves like an URL instance", () => {
      const url = new URL(inithref);
      const rurl = createURL(inithref);

      assert(url.href === rurl.href);
      assert(url.search === rurl.search);
      assert(url.hash === rurl.hash);
      assert(url.origin === rurl.origin);

      url.search = rurl.search = "foo=1&=foo=2&bar=baz";

      assert(url.href === rurl.href);
      assert(url.search === rurl.search);
      assert(url.hash === rurl.hash);
      assert(url.origin === rurl.origin);
    });

    //   it("is reactive and granular", () => {
    //     const url = createURL(inithref);
    //     const updates = {
    //       href: 0,
    //       search: 0,
    //       hash: 0
    //     };
    //     createComputed(
    //       on(
    //         () => url.href,
    //         () => updates.href++,
    //         { defer: true }
    //       )
    //     );
    //     createComputed(
    //       on(
    //         () => url.search,
    //         () => updates.search++,
    //         { defer: true }
    //       )
    //     );
    //     createComputed(
    //       on(
    //         () => url.hash,
    //         () => updates.hash++,
    //         { defer: true }
    //       )
    //     );

    //     url.search = "foo=1&=foo=2&bar=baz";

    //     expect(updates.hash, "hash hasn't changed").toBe(0);
    //     // expect(updates.href, "href has changed").toBe(1);
    //     expect(updates.search, "search has changed").toBe(1);
    //   });

    dispose();
  });
});
