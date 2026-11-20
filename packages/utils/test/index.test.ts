import { renderHydrationRoundTrip } from "../../../scripts/test-utils/hydration-harness.ts";
import { describe, test, expect, assert, vi } from "vitest";
import { createEffect, createRoot, createSignal, createStore, flush } from "solid-js";
import {
  handleDiffArray,
  arrayEquals,
  asArray,
  createHydratableSignal,
  createServerSafeSignal,
  wrapSetter,
  globalRegistry,
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

describe("globalRegistry", () => {
  test("calls init exactly once and returns the same instance on subsequent calls", () => {
    const init = vi.fn(() => ({ count: 0 }));
    const key = `test:globalRegistry:${Math.random()}`;
    const first = globalRegistry(key, init);
    const second = globalRegistry(key, init);
    expect(first).toBe(second);
    expect(init).toHaveBeenCalledOnce();
  });

  test("survives a fresh call site sharing the same key — simulates duplicate installed copies", () => {
    const key = `test:globalRegistry:duplicate-copy:${Math.random()}`;
    // Simulates two separate module instances of the same package (e.g. a version-skewed
    // duplicate dependency) each calling globalRegistry with the same key: both must observe
    // the same mutations, matching real singleton semantics across copies.
    const registryA = globalRegistry(key, () => ({ stack: [] as string[] }));
    const registryB = globalRegistry(key, () => ({ stack: ["should never be used"] }));
    registryA.stack.push("from-a");
    expect(registryB.stack).toEqual(["from-a"]);
  });

  test("different keys get independent instances", () => {
    const a = globalRegistry(`test:globalRegistry:a:${Math.random()}`, () => ({ value: 1 }));
    const b = globalRegistry(`test:globalRegistry:b:${Math.random()}`, () => ({ value: 2 }));
    expect(a).not.toBe(b);
  });
});

describe("wrapSetter", () => {
  test("wraps a signal", () => {
    const wrapped = vi.fn(x => x);
    const [state, setState] = wrapSetter(createSignal(0), setter => next => wrapped(setter(next)));
    setState(1);
    flush();
    expect(state()).toBe(1);
    expect(wrapped).toHaveBeenCalledWith(1);
    setState(c => c + 1);
    flush();
    expect(state()).toBe(2);
  });
  test("wraps a store", () => {
    const wrapped = vi.fn(x => x);
    const [state, setState] = wrapSetter(
      createStore({ on: false }),
      setter => next => wrapped(setter(next)),
    );
    setState(s => {
      s.on = !s.on;
    });
    flush();
    expect(state.on).toBe(true);
    expect(wrapped).toHaveBeenCalled();
  });
  test("leaves additional values in the new tuple", () => {
    const wrapped = vi.fn(x => x);
    const modifiedSignal = [
      ...createSignal(0),
      {} as Record<string, number>,
      [] as string[],
    ] as const;
    const wrappedSignal = wrapSetter(modifiedSignal, setter => next => wrapped(setter(next)));
    expect(wrappedSignal[0]).toBe(modifiedSignal[0]);
    expect(wrappedSignal[2]).toBe(modifiedSignal[2]);
    expect(wrappedSignal[3]).toBe(modifiedSignal[3]);
    expect(wrappedSignal).toHaveLength(modifiedSignal.length);
  });
});
describe("createServerSafeSignal", () => {
  test("is a real signal on the client", () => {
    const [count, setCount] = createServerSafeSignal(0);
    let seen: number | undefined;
    const dispose = createRoot(d => {
      createEffect(
        () => count(),
        v => {
          seen = v;
        },
      );
      return d;
    });
    flush();
    expect(seen).toBe(0);

    expect(setCount(c => c + 1)).toBe(1);
    flush();
    expect(count()).toBe(1);
    expect(seen).toBe(1);
    dispose();
  });
});

test("hydrates primitive output and its following sibling", async () => {
  const result = await renderHydrationRoundTrip(
    `
    import { createHydratableSignal } from "@solid-primitives/utils";
    function Child() { createHydratableSignal(false, () => true); return <button ref={el => el.dataset.bound = "child"}>child</button>; }
    export default function App() { return <><Child /><span ref={el => el.dataset.bound = "sibling"}>sibling</span></>; }
  `,
    import.meta.dirname,
  );
  try {
    expect(result.consoleMessages).toEqual([]);
    expect(result.container.querySelector("button")).toBe(result.serverNodes[0]);
    expect(result.container.querySelector("span")).toBe(result.serverNodes[1]);
    expect((result.serverNodes[0] as HTMLElement).dataset.bound).toBe("child");
    expect((result.serverNodes[1] as HTMLElement).dataset.bound).toBe("sibling");
  } finally {
    result.cleanup();
  }
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
    withAccess("", v => received.push(v));
    withAccess(false, v => received.push(v));
    expect(received).toEqual([1, 2, 0, "", false]);
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
