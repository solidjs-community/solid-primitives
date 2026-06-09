import { createEventDispatcher } from "../src/index.js";
import { describe, test, expect } from "vitest";

interface Props {
  onFoo: (evt: CustomEvent<string>) => void;
}

describe("createEventDispatcher server", () => {
  test("returns a no-op dispatcher that always returns true", () => {
    let called = false;
    const dispatch = createEventDispatcher<Props>({ onFoo: () => { called = true; } });

    expect(dispatch("foo" as any, "payload")).toBe(true);
    expect(called).toBe(false);
  });
});
