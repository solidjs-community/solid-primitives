import { describe, expect, vi, it } from "vitest";
import { makeConnectivityListener, createConnectivitySignal } from "../src";

describe("makeConnectivityListener", () => {
  it("works in server", () => {
    const cb = vi.fn();
    makeConnectivityListener(cb);
    expect(cb).not.toBeCalled();
  });
});

describe("createConnectivitySignal", () => {
  it("works in server", () => {
    const onLine = createConnectivitySignal();
    expect(onLine()).toBe(true);
  });
});
