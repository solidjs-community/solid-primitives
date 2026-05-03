import { describe, test, expect } from "vitest";
import { mergeRefs } from "../src/index.js";

describe("mergeRefs", () => {
  test("chains multiple ref callbacks", () => {
    let local: HTMLButtonElement | undefined;
    let forwarded: HTMLButtonElement | undefined;
    const el = document.createElement("button") as HTMLButtonElement;

    const merged = mergeRefs<HTMLButtonElement>(
      e => (local = e),
      e => (forwarded = e),
    );
    merged(el);

    expect(local).instanceOf(HTMLButtonElement);
    expect(forwarded).instanceOf(HTMLButtonElement);
    expect(local).toBe(el);
    expect(forwarded).toBe(el);
  });

  test("ignores undefined refs", () => {
    const el = document.createElement("button") as HTMLButtonElement;
    let called = false;
    const merged = mergeRefs<HTMLButtonElement>(undefined, e => {
      called = true;
    });
    merged(el);
    expect(called).toBe(true);
  });
});
