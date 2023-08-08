import { describe, expect, test } from "vitest";
import {
  createHydratableStaticStore,
  createStaticStore,
  createDerivedStaticStore,
} from "../src/index.js";

describe("createStaticStore", () => {
  test("doesn't break in SSR", () => {
    const [state, setState] = createStaticStore({ foo: "server" });
    expect(state).toEqual({ foo: "server" });
    expect(setState).toBeInstanceOf(Function);
  });
});

describe("createHydratableStaticStore", () => {
  test("createHydratableStaticStore() - SSR", () => {
    const [state, setState] = createHydratableStaticStore({ foo: "server" }, () => ({
      foo: "client",
    }));
    expect(state).toEqual({ foo: "server" });
    expect(setState).toBeInstanceOf(Function);
  });
});

describe("createDerivedStaticStore", () => {
  test("createDerivedStaticStore() - SSR", () => {
    const state = createDerivedStaticStore(() => ({ foo: "server" }));
    expect(state).toEqual({ foo: "server" });
  });
});
