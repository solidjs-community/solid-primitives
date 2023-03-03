import { createHydrateSignal } from "../src";
import { describe, expect, it } from "vitest";

describe("API doesn't break in SSR", () => {
  it("createHydrateSignal() - SSR", () => {
    const [state, setState] = createHydrateSignal("server", () => "client");
    expect(state()).toEqual("server");
    expect(setState).toBeInstanceOf(Function);
  });
});
