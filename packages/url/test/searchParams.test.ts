import { describe, it, assert, expect } from "vitest";
import { createSearchParams } from "../src";
import { createComputed, createRoot, createSignal, on } from "solid-js";

const inithref = "http://www.domain.com?foo=1&=foo=2&bar=baz";

describe("ReactiveSearchParams", () => {
  createRoot(dispose => {
    it("behaves like an URLSearchParams instance", () => {
      const sp = new URLSearchParams(inithref);
      const rsp = createSearchParams(inithref);

      expect([...sp], "initial should match the sp").toEqual([...rsp]);

      rsp.set("foo", "test");
      rsp.delete("bar");
      rsp.append("name", "John");

      expect(rsp.getAll("foo")).toEqual(["test"]);
      expect(rsp.getAll("name")).toEqual(["John"]);
      expect(rsp.getAll("bar")).toEqual([]);
    });

    dispose();
  });
});
