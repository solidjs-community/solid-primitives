import { describe, expect, it } from "vitest";

import { createScriptLoader } from "../src";

describe("API doesn't break in SSR", () => {
  it("createScriptLoader() - SSR", () => {
    expect(createScriptLoader({ src: "url" })).toEqual([undefined, expect.any(Function)]);
  });
});
