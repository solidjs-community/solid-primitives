import { renderToString } from "solid-js/web";
import { describe, expect, test } from "vitest";
import { resolveElements, resolveFirst } from "../src/index.js";

describe("SSR", () => {
  test("resolveElements", () => {
    const resolved = resolveElements(() => (
      <>
        <div>hello</div>
        <span>world</span>
        {() => <div>nested</div>}
      </>
    ));
    const string = renderToString(resolved);
    expect(string).toBe("<div>hello</div><span>world</span><div>nested</div>");
  });

  test("resolveFirst", () => {
    const resolved = resolveFirst(() => (
      <>
        <div>hello</div>
        <span>world</span>
        {() => <div>nested</div>}
      </>
    ));
    const string = renderToString(resolved);
    expect(string).toBe("<div>hello</div>");
  });
});
