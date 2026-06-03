import { describe, it, expect } from "vitest";
import { ReactiveSet, ReactiveWeakSet } from "../src/index.js";

describe("ReactiveSet (server)", () => {
  it("works as a plain Set on the server", () => {
    const set = new ReactiveSet([1, 2, 3]);
    expect([...set]).toEqual([1, 2, 3]);
    expect(set.has(2)).toBe(true);
    set.add(4);
    expect(set.has(4)).toBe(true);
    set.delete(1);
    expect(set.has(1)).toBe(false);
    expect(set.size).toBe(3);
    set.clear();
    expect(set.size).toBe(0);
    expect(set).instanceOf(Set);
    expect(set).instanceOf(ReactiveSet);
  });
});

describe("ReactiveWeakSet (server)", () => {
  it("works as a plain WeakSet on the server", () => {
    const a = {};
    const b = {};
    const set = new ReactiveWeakSet([a, b]);
    expect(set.has(a)).toBe(true);
    expect(set.has(b)).toBe(true);
    set.delete(a);
    expect(set.has(a)).toBe(false);
    expect(set).instanceOf(WeakSet);
    expect(set).instanceOf(ReactiveWeakSet);
  });
});
