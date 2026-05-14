import { describe, test, expect, assert, vi } from "vitest";
import { createSignal, createStore, flush, type Signal } from "solid-js";
import { handleDiffArray, arrayEquals, createHydratableSignal, wrapSetter } from "../src/index.js";

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

describe("wrapSetter", () => {
  test("wraps a signal", () => {
    const wrapped = vi.fn((x) => x);
    const [state, setState] = wrapSetter(createSignal(0), (setter) => (next) => wrapped(setter(next)));
    setState(1);
    flush();
    expect(state()).toBe(1);
    expect(wrapped).toHaveBeenCalledWith(1);
    setState(c => c + 1);
    flush();
    expect(state()).toBe(2);
  });
  test("wraps a store", () => {
    const wrapped = vi.fn((x) => x);
    const [state, setState] = wrapSetter(createStore({ on: false }), (setter) => (next) => wrapped(setter(next)));
    setState((s) => { s.on = !s.on; });
    flush();
    expect(state.on).toBe(true);
    expect(wrapped).toHaveBeenCalled();
  });
  test("leaves additional values in the new tuple", () => {
    const wrapped = vi.fn((x) => x);
    const modifiedSignal = [...createSignal(0), {} as Record<string, number>, [] as string[]] as const;
    const wrappedSignal = wrapSetter(modifiedSignal, (setter) => (next) => wrapped(setter(next)));
    expect(wrappedSignal[0]).toBe(modifiedSignal[0]);
    expect(wrappedSignal[2]).toBe(modifiedSignal[2]);
    expect(wrappedSignal[3]).toBe(modifiedSignal[3]);
    expect(wrappedSignal).toHaveLength(modifiedSignal.length);
  });
});