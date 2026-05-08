import { describe, it, expect, afterEach } from "vitest";
import { getRemSize, createRemSize, useRemSize, setServerRemSize } from "../src/index.js";

afterEach(() => {
  // Reset server rem size to default between tests
  setServerRemSize(16);
});

describe("getRemSize (server)", () => {
  it("returns 16 by default", () => {
    expect(getRemSize()).toBe(16);
  });

  it("reflects the value set by setServerRemSize", () => {
    setServerRemSize(10);
    expect(getRemSize()).toBe(10);
  });
});

describe("createRemSize (server)", () => {
  it("returns an accessor with the server rem size", () => {
    const remSize = createRemSize();
    expect(remSize()).toBe(16);
  });

  it("reflects setServerRemSize", () => {
    setServerRemSize(12);
    const remSize = createRemSize();
    expect(remSize()).toBe(12);
  });
});

describe("useRemSize (server)", () => {
  it("returns an accessor with the server rem size", () => {
    const remSize = useRemSize();
    expect(remSize()).toBe(16);
  });
});

describe("setServerRemSize", () => {
  it("is a no-op in the browser environment (runs only on server)", () => {
    // In SSR mode, setServerRemSize is the real setter
    setServerRemSize(24);
    expect(getRemSize()).toBe(24);
  });
});
