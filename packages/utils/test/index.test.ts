import { describe, test, expect, assert, vi } from "vitest";
import {
  handleDiffArray,
  arrayEquals,
  asArray,
  createHydratableSignal,
  withAccess,
} from "../src/index.js";

describe("handleDiffArray", () => {
  test("handleAdded called for new array", () => {
    const a: string[] = [];
    const b = ["foo", "bar", "baz", "hello", "world"];
    const captured: any[] = [];
    handleDiffArray(
      b,
      a,
      item => {
        captured.push(item);
      },
      () => {
        throw "Should never run";
      },
    );
    expect(captured.length).toBe(5);
    assert(captured.includes("foo"));
    assert(captured.includes("bar"));
    assert(captured.includes("baz"));
    assert(captured.includes("hello"));
    assert(captured.includes("world"));
  });

  test("handleRemoved for cleared array", () => {
    const a = ["foo", "bar", "baz", "hello", "world"];
    const b: string[] = [];
    const captured: any[] = [];
    handleDiffArray(
      b,
      a,
      () => {
        throw "Should never run";
      },
      item => {
        captured.push(item);
      },
    );
    expect(captured.length).toBe(5);
    assert(captured.includes("foo"));
    assert(captured.includes("bar"));
    assert(captured.includes("baz"));
    assert(captured.includes("hello"));
    assert(captured.includes("world"));
  });

  test("callbacks shouldn't run for same array", () => {
    const a = ["foo", "bar", "baz", "hello", "world"];
    const b = ["foo", "bar", "baz", "hello", "world"];
    handleDiffArray(
      b,
      a,
      () => {
        throw "Should never run";
      },
      () => {
        throw "Should never run";
      },
    );
  });

  test("calls callbacks for added and removed items", () => {
    const a = ["foo", "baz", "hello"];
    const b = ["foo", "bar", "hello", "world"];
    const capturedAdded: any[] = [];
    const capturedRemoved: any[] = [];
    handleDiffArray(
      b,
      a,
      item => capturedAdded.push(item),
      item => capturedRemoved.push(item),
    );
    expect(capturedAdded.length).toBe(2);
    assert(capturedAdded.includes("bar"));
    assert(capturedAdded.includes("world"));

    expect(capturedRemoved.length).toBe(1);
    assert(capturedRemoved.includes("baz"));
  });
});

describe("arrayEquals", () => {
  test("arrayEquals", () => {
    const _1: any[] = [];
    assert(arrayEquals(_1, _1));
    assert(arrayEquals(_1, []));
    assert(arrayEquals([1, 2, 3], [1, 2, 3]));
    assert(arrayEquals([1, 2, _1], [1, 2, _1]));

    assert(!arrayEquals([1, 2, 3], [1, 2, 3, 4]));
    assert(!arrayEquals([1, 2, 3], [1, 0, 3]));
    assert(!arrayEquals([1, 2, _1], [1, 2, []]));
  });
});

describe("createHydratableSignal", () => {
  test("createHydratableSignal() - CSR", () => {
    const [state, setState] = createHydratableSignal("server", () => "client");
    expect(state()).toEqual("client");
    expect(setState).toBeInstanceOf(Function);
  });
});

describe("withAccess", () => {
  test("calls the function with a value or the result of an accessor", () => {
    const received: unknown[] = [];
    withAccess(1, v => received.push(v));
    withAccess(
      () => 2,
      v => received.push(v),
    );
    withAccess(0, v => received.push(v));
    expect(received).toEqual([1, 2, 0]);
  });

  test("skips undefined and null", () => {
    const fn = vi.fn();
    withAccess(undefined, fn);
    withAccess(null, fn);
    withAccess(() => undefined, fn);
    withAccess(() => null, fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("asArray", () => {
  test("wraps single values", () => {
    expect(asArray("a")).toEqual(["a"]);
    const obj = {};
    expect(asArray(obj)).toEqual([obj]);
  });

  test("keeps arrays as they are", () => {
    const arr = [1, 2];
    expect(asArray(arr)).toBe(arr);
  });

  test("keeps falsy values that are not nullish", () => {
    expect(asArray(0)).toEqual([0]);
    expect(asArray("")).toEqual([""]);
    expect(asArray(false)).toEqual([false]);
  });

  test("returns an empty array for undefined and null", () => {
    expect(asArray(undefined)).toEqual([]);
    expect(asArray(null)).toEqual([]);
  });
});
