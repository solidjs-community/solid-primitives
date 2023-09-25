import { describe, test, expect, vi } from "vitest";
import { DEV, unwrap } from "solid-js/store";
import { createMutable } from "../src/index.js";

describe("Dev features", () => {
  test("OnStoreNodeUpdate Hook", () => {
    const cb = vi.fn();
    DEV!.hooks.onStoreNodeUpdate = cb;

    const store = createMutable({ firstName: "John", lastName: "Smith", inner: { foo: 1 } });
    expect(cb).toHaveBeenCalledTimes(0);

    store.firstName = "Matt";
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith(unwrap(store), "firstName", "Matt", "John");

    store.inner.foo = 2;
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb).toHaveBeenCalledWith(unwrap(store.inner), "foo", 2, 1);
  });
});
