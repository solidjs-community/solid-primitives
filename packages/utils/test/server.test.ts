import { createHydratableSignal } from "../src";
import { describe, expect, test } from "vitest";

describe("API doesn't break in SSR", () => {
  test("createHydratableSignal() - SSR", () => {
    const [state, setState] = createHydratableSignal("server", () => "client");
    expect(state()).toEqual("server");
    expect(setState).toBeInstanceOf(Function);
  });
});
