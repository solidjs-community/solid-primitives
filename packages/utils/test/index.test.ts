import { describe, test, expect, assert } from "vitest";
import { handleDiffArray, arrayEquals, createHydratableSignal } from "../src";

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
