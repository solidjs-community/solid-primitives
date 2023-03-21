import { createHydratableSignal, createHydratableStaticStore } from "../src";
import { describe, expect, test } from "vitest";

describe("API doesn't break in SSR", () => {
  test("createHydratableSignal() - SSR", () => {
    const [state, setState] = createHydratableSignal("server", () => "client");
    expect(state()).toEqual("server");
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
