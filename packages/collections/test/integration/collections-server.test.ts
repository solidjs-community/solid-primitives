import { afterEach, describe, expect, it } from "vitest";
import { createRoot, NotReadyError } from "solid-js";
import { isServer } from "@solidjs/web";
import { getProjectionTrace } from "collection-test-server-signals";
import { createReactiveMap, createReactiveSet } from "../../src/index.js";
const disposers: (() => void)[] = [];
function root<T>(fn: () => T): T {
  return createRoot(d => {
    disposers.push(d);
    return fn();
  });
}
afterEach(() => {
  while (disposers.length) disposers.pop()!();
});
const tick = async () => {
  for (let i = 0; i < 40; i++) await Promise.resolve();
};
const trace = (collection: any) =>
  getProjectionTrace(collection.data.store)!.subscribe()[Symbol.asyncIterator]();

describe("server collections", () => {
  it("uses the server runtime and preserves synchronous raw key/value identity", () => {
    expect(isServer).toBe(true);
    const key = {},
      value = new Date(0);
    const map = root(() =>
      createReactiveMap<object, Date>(draft => {
        draft.set(key, value);
      }),
    );
    expect(map.get(key)).toBe(value);
    expect([...map]).toEqual([[key, value]]);
    expect([...map.keys()][0]).toBe(key);
    const set = root(() => createReactiveSet<object>(() => new Set([key])));
    expect(set.has(key)).toBe(true);
  });
  it("suspends initial promise reads then preserves identity", async () => {
    const key = {},
      value = Object.freeze({ key });
    const map = root(() => createReactiveMap(async () => new Map([[key, value]])));
    expect(() => map.has(key)).toThrow(NotReadyError);
    await tick();
    expect(map.get(key)).toBe(value);
    const first = await trace(map).next();
    expect(Object.values(first.value).some((v: any) => v?.value === value)).toBe(true);
  });
  it("locks rendered state at the first yield and transports terminal mutations", async () => {
    const key = {},
      terminalKey = {};
    const map = root(() =>
      createReactiveMap<object, number>(async function* (draft) {
        draft.set(key, 1);
        yield;
        draft.set(terminalKey, 2);
      }),
    );
    await tick();
    expect([...map]).toEqual([[key, 1]]);
    const iterator = trace(map);
    const first = await iterator.next();
    expect(first.value.size).toBe(1);
    const finalPatch = await iterator.next();
    expect(finalPatch.done).toBe(false);
    expect(finalPatch.value.some((patch: any) => patch[0][0] === "size" && patch[1] === 2)).toBe(
      true,
    );
    expect((await iterator.next()).done).toBe(true);
    expect([...map]).toEqual([[key, 1]]);
  });
  it("settles an iterable with no explicit yields, including its draft edits", async () => {
    const set = root(() =>
      createReactiveSet<number>(async function* (draft) {
        draft.add(1);
      }),
    );
    await tick();
    expect([...set]).toEqual([1]);
    const first = await trace(set).next();
    expect(first.value.size).toBe(1);
  });
  it("keeps loadingValue visible while serializing the actual answer", async () => {
    const key = {},
      final = {};
    const loading = new Set([key]);
    const set = root(() =>
      createReactiveSet<object>(
        async draft => {
          draft.clear();
          draft.add(final);
        },
        { loadingValue: loading },
      ),
    );
    expect([...set]).toEqual([key]);
    await tick();
    expect([...set]).toEqual([key]);
    const first = await trace(set).next();
    expect(Object.values(first.value).some((v: any) => v?.value === final)).toBe(true);
    expect([...loading]).toEqual([key]);
  });
  it("does not run a client source on the server", () => {
    let calls = 0;
    const set = root(() =>
      createReactiveSet(
        () => {
          calls++;
          return new Set([1]);
        },
        {
          ssrSource: "client",
          loadingValue: new Set<number>(),
        },
      ),
    );
    expect([...set]).toEqual([]);
    expect(calls).toBe(0);
  });
});
