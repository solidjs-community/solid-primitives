import { describe, test, expect, vi } from "vitest";
import { DEV } from "solid-js";
import { createMutable } from "../src/index.js";

describe("Dev features", () => {
  test("OnStoreNodeUpdate Hook", () => {
    const cb = vi.fn();
    DEV!.hooks.onStoreNodeUpdate = cb;

    const store = createMutable({ firstName: "John", lastName: "Smith", inner: { foo: 1 } });
    expect(cb).toHaveBeenCalledTimes(0);

    store.firstName = "Matt";
    expect(cb).toHaveBeenCalledTimes(1);
    const firstCall = cb.mock.calls[0]!;
    expect(firstCall[1]).toBe("firstName");
    expect(firstCall[2]).toBe("Matt");
    expect(firstCall[3]).toBe("John");

    store.inner.foo = 2;
    expect(cb).toHaveBeenCalledTimes(2);
    const secondCall = cb.mock.calls[1]!;
    expect(secondCall[1]).toBe("foo");
    expect(secondCall[2]).toBe(2);
    expect(secondCall[3]).toBe(1);
  });
});
