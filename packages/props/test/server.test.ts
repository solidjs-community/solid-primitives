import { describe, it, expect } from "vitest";
import { combineProps, filterProps, createPropsPredicate } from "../src/index.js";

describe("combineProps SSR", () => {
  it("combines handlers", () => {
    let called = 0;
    const combined = combineProps({ onClick: () => called++ }, { onClick: () => called++ });
    combined.onClick();
    expect(called).toBe(2);
  });

  it("combines classes", () => {
    const combined = combineProps({ class: "a" }, { class: "b" });
    expect(combined.class).toBe("a b");
  });

  it("combines styles", () => {
    const combined = combineProps({ style: { margin: "4px" } }, { style: { padding: "4px" } });
    expect(combined.style).toEqual({ margin: "4px", padding: "4px" });
  });
});

describe("filterProps SSR", () => {
  it("filters props", () => {
    const props = { a: 1, b: 2, c: 3 };
    const filtered = filterProps(props, key => key !== "b");
    expect(filtered).toEqual({ a: 1, c: 3 });
  });

  it("createPropsPredicate caches in server context", () => {
    const props = { a: 1, b: 2, c: 3 };
    const checked: string[] = [];
    const filtered = filterProps(
      props,
      createPropsPredicate(props, key => {
        checked.push(key);
        return key !== "b";
      }),
    );
    filtered.a;
    filtered.a;
    expect(checked).toEqual(["a"]);
    expect(filtered).toEqual({ a: 1, c: 3 });
  });
});
