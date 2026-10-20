import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import {
  $TARGET,
  action,
  createEffect,
  createRoot,
  createSignal,
  createStore,
  flush,
  isPending,
  latest,
  NotReadyError,
  refresh,
} from "@solidjs/signals";
import { createReactiveMap, createReactiveSet } from "@solid-primitives/collections";

const disposers: (() => void)[] = [];
function root<T>(fn: () => T): T {
  return createRoot(dispose => {
    disposers.push(dispose);
    return fn();
  });
}
afterEach(() => {
  while (disposers.length) disposers.pop()!();
  flush();
});
const tick = async () => {
  for (let i = 0; i < 30; i++) await Promise.resolve();
  flush();
};
function deferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
}
function observe<T>(read: () => T) {
  let runs = 0;
  const values: T[] = [];
  createEffect(
    () => {
      runs++;
      return read();
    },
    value => {
      values.push(value);
    },
  );
  return {
    values,
    get runs() {
      return runs;
    },
  };
}
// Deliberate private inspection: prove nodes themselves are lazy/independent,
// not just filtered callbacks. This adds no debug hook to production code.
const target = (collection: any) => collection.data.store[$TARGET];
const count = (record: object | null) => (record ? Reflect.ownKeys(record).length : 0);

describe("reactive collection factories", () => {
  it("keeps backend fields out of ordinary enumeration and JSON", () => {
    const map = root(() => createReactiveMap([["a", 1]]));
    const set = root(() => createReactiveSet([1]));
    for (const collection of [map, set]) {
      expect(Object.keys(collection)).toEqual([]);
      expect(JSON.stringify(collection)).toBe("{}");
    }
    expect([...new Map(map)]).toEqual([["a", 1]]);
    expect([...new Set(set)]).toEqual([1]);
  });
  it("infers iterable, compute, and async result types", () => {
    root(() => {
      const entries = [["a", 1]] as const;
      expectTypeOf(createReactiveMap(entries).get("a")).toEqualTypeOf<1 | undefined>();
      expectTypeOf(createReactiveMap(() => new Map<string, number>()).get("a")).toEqualTypeOf<
        number | undefined
      >();
      const asyncMap = createReactiveMap(async () => new Map<string, number>());
      expectTypeOf(asyncMap).toMatchTypeOf<Map<string, number>>();
      expectTypeOf(createReactiveSet(() => new Set<number>())).toMatchTypeOf<Set<number>>();
    });
  });

  it("allocates independent membership nodes only on tracked reads and releases them", () => {
    const set = root(() => createReactiveSet([0]));
    const backing = target(set);
    expect(set.has(0)).toBe(true);
    expect(count(backing.h)).toBe(0);
    let disposeReaders!: () => void;
    const [zero, one] = createRoot(dispose => {
      disposeReaders = dispose;
      return [observe(() => set.has(0)), observe(() => set.has(1))];
    });
    flush();
    expect(count(backing.h)).toBe(2);
    expect(backing.h["number:0"]).not.toBe(backing.h["number:1"]);
    set.add(1);
    flush();
    expect([zero.runs, one.runs]).toEqual([1, 2]);
    set.add(2);
    flush();
    expect([zero.runs, one.runs]).toEqual([1, 2]);
    disposeReaders();
    flush();
    expect(count(backing.h)).toBe(0);
  });

  it("separates value, presence, size, and key-order subscriptions", () => {
    const map = root(() => createReactiveMap<string, number | undefined>([["a", 1]]));
    const readers = root(() => ({
      value: observe(() => map.get("a")),
      has: observe(() => map.has("a")),
      missing: observe(() => map.get("b")),
      size: observe(() => map.size),
      keys: observe(() => [...map.keys()]),
      values: observe(() => [...map.values()]),
    }));
    flush();
    map.set("a", 2);
    flush();
    expect([readers.value.runs, readers.has.runs, readers.size.runs, readers.keys.runs]).toEqual([
      2, 1, 1, 1,
    ]);
    map.set("b", undefined);
    flush();
    expect(readers.missing.runs).toBe(1);
    expect(readers.values.values.at(-1)).toEqual([2, undefined]);
    expect(readers.keys.values.at(-1)).toEqual(["a", "b"]);
    expect(readers.size.values).toEqual([1, 2]);
    map.delete("b");
    flush();
    expect(readers.missing.runs).toBe(1);
    map.set("a", 2);
    flush();
    expect(readers.value.runs).toBe(2);
    expect(readers.values.values.at(-1)).toEqual([2]);
  });

  it("retains native key identity, SameValueZero, and shallow values", () => {
    const object = {},
      other = {},
      fn = () => {},
      symbol = Symbol("key"),
      value = {};
    const keys = [
      object,
      other,
      fn,
      symbol,
      NaN,
      -0,
      1,
      "1",
      1n,
      null,
      undefined,
      $TARGET,
      Symbol.for("order"),
      Symbol("key"),
      "order",
      "size",
      "__proto__",
      "constructor",
    ];
    const map = root(() =>
      createReactiveMap<unknown, object>(keys.map(key => [key, value] as const)),
    );
    expect(map.size).toBe(keys.length);
    for (const key of keys) expect(map.get(key)).toBe(value);
    expect(map.has({})).toBe(false);
    expect(Object.is([...map.keys()][5], 0)).toBe(true);
    map.delete(NaN);
    map.delete(0);
    flush();
    expect(map.has(NaN)).toBe(false);
    expect(map.has(-0)).toBe(false);
    expect(map.get(symbol)).toBe(value);
  });

  it("batches writes, composes mutators, and does not mutate input collections", () => {
    const original = new Map([["a", 1]]);
    const map = root(() => createReactiveMap(original));
    expect(map.set("b", 2)).toBe(map);
    expect(map.get("b")).toBeUndefined();
    expect(map.delete("b")).toBe(true);
    expect(map.delete("b")).toBe(false);
    map.set("c", 3);
    flush();
    expect([...map]).toEqual([
      ["a", 1],
      ["c", 3],
    ]);
    expect([...original]).toEqual([["a", 1]]);
    map.clear();
    map.set("d", 4);
    flush();
    expect([...map]).toEqual([["d", 4]]);
  });

  it("does not raw-mark user objects or interfere with deep stores", () => {
    const before = { n: 1 },
      after = { n: 2 };
    const [existing] = createStore({ before });
    expect(existing.before).not.toBe(before);
    const map = root(() =>
      createReactiveMap([
        ["before", before],
        ["after", after],
      ]),
    );
    const [subsequent] = createStore({ after });
    expect(subsequent.after).not.toBe(after);
    expect(map.get("before")).toBe(before);
    expect(map.get("after")).toBe(after);
    const observer = root(() => observe(() => map.get("before")));
    flush();
    map.set("before", before);
    flush();
    expect(observer.runs).toBe(1);
    const replacement = { n: 3 };
    map.set("before", replacement);
    flush();
    expect(observer.values).toEqual([before, replacement]);
    expect(map.get("before")).toBe(replacement);
  });

  it("preserves raw identity in compute drafts before and after suspension", async () => {
    const key = Object.freeze({ id: 1 }),
      value = Object.freeze({ time: new Date(0) });
    const gate = deferred();
    let seen: unknown, seenKey: unknown;
    const map = root(() =>
      createReactiveMap<object, typeof value>(async draft => {
        draft.set(key, value);
        seen = draft.get(key);
        seenKey = [...draft.keys()][0];
        await gate.promise;
        expect(draft.get(key)).toBe(value);
        expect(draft.has([...draft.keys()][0]!)).toBe(true);
        draft.delete(key);
        draft.set(key, value);
      }),
    );
    expect(seen).toBe(value);
    expect(seenKey).toBe(key);
    gate.resolve();
    await tick();
    expect([...map.keys()]).toEqual([key]);
    expect(map.get(key)).toBe(value);
  });

  it("tracks order-only replacement without invalidating membership or size", () => {
    const [source, setSource] = createSignal(new Set([0, 1]));
    const set = root(() => createReactiveSet(source));
    const [members, size, order] = root(() => [
      observe(() => set.has(0)),
      observe(() => set.size),
      observe(() => [...set]),
    ]);
    flush();
    setSource(new Set([1, 0]));
    flush();
    expect(order.values).toEqual([
      [0, 1],
      [1, 0],
    ]);
    expect([members.runs, size.runs]).toEqual([1, 1]);
    set.delete(1);
    set.add(1);
    flush();
    expect([...set]).toEqual([0, 1]);
    expect(set.size).toBe(2);
  });

  it("forEach receives the facade and iterators read the current visible state", () => {
    const map = root(() =>
      createReactiveMap([
        ["a", 1],
        ["b", 2],
      ]),
    );
    const iterator = map.entries();
    map.clear();
    flush();
    expect([...iterator]).toEqual([]);
    map.set("a", 3);
    flush();
    const context = {};
    map.forEach(function (this: object, value, key, self) {
      expect(this).toBe(context);
      expect(self).toBe(map);
      expect([key, value]).toEqual(["a", 3]);
    }, context);
    const set = root(() => createReactiveSet([1]));
    set.forEach((value, key, self) => {
      expect(value).toBe(key);
      expect(self).toBe(set);
    });
  });

  it("overrides native set algebra instead of reading the facade's empty native storage", () => {
    const set = root(() => createReactiveSet([1, 2]));
    expect([...set.union(new Set([2, 3]))]).toEqual([1, 2, 3]);
    expect([...set.intersection(new Set([2, 3]))]).toEqual([2]);
    expect([...set.difference(new Set([2, 3]))]).toEqual([1]);
    expect([...set.symmetricDifference(new Set([2, 3]))]).toEqual([1, 3]);
    expect(set.isSubsetOf(new Set([1, 2, 3]))).toBe(true);
    expect(set.isSupersetOf(new Set([1]))).toBe(true);
    expect(set.isDisjointFrom(new Set([3]))).toBe(true);
  });

  it("supports synchronous draft mutation and manual-write precedence", () => {
    const [value, setValue] = createSignal(1);
    const map = root(() =>
      createReactiveMap<string, number>(draft => {
        draft.set("a", value());
      }),
    );
    expect(map.get("a")).toBe(1);
    setValue(2);
    map.set("a", 10);
    flush();
    expect(map.get("a")).toBe(10);
    setValue(3);
    flush();
    expect(map.get("a")).toBe(3);
  });

  it("propagates computation errors through collection reads and recovers", () => {
    const [fail, setFail] = createSignal(false);
    const error = new Error("collection source failed");
    const map = root(() =>
      createReactiveMap<string, number>(() => {
        if (fail()) throw error;
        return new Map([["a", 1]]);
      }),
    );
    setFail(true);
    flush();
    for (const read of [() => map.get("a"), () => map.has("a"), () => map.size, () => [...map]])
      expect(read).toThrow(error.message);
    setFail(false);
    flush();
    expect([...map]).toEqual([["a", 1]]);
  });

  it("suspends all initial read surfaces and settles an unchanged absent entry", async () => {
    const gate = deferred();
    const set = root(() =>
      createReactiveSet<number>(async () => {
        await gate.promise;
      }),
    );
    const reader = root(() => observe(() => set.has(0)));
    flush();
    for (const read of [
      () => set.size,
      () => set.has(0),
      () => [...set],
      () => set.entries().next(),
    ])
      expect(read).toThrow(NotReadyError);
    expect(reader.values).toEqual([]);
    gate.resolve();
    await tick();
    expect(reader.values).toEqual([false]);
    expect(set.size).toBe(0);
  });

  it("ignores superseded promise draft writes and replacements", async () => {
    const gates = [deferred(), deferred()];
    const [run, next] = createSignal(0);
    const map = root(() =>
      createReactiveMap<string, number>(async draft => {
        const i = run();
        await gates[i].promise;
        draft.set("draft", i);
        return new Map([["result", i]]);
      }),
    );
    next(1);
    flush();
    gates[1].resolve();
    await tick();
    expect([...map]).toEqual([["result", 1]]);
    gates[0].resolve();
    await tick();
    expect([...map]).toEqual([["result", 1]]);
  });

  it("accepts thenables and preserves returned object references", async () => {
    const key = {},
      value = {};
    const map = root(() =>
      createReactiveMap<object, object>(() => ({
        then(resolve: any) {
          return Promise.resolve(resolve(new Map([[key, value]])));
        },
      })),
    );
    await tick();
    expect(map.get(key)).toBe(value);
  });

  it("supports replacement and void yields plus terminal draft mutations", async () => {
    const a = deferred(),
      b = deferred();
    const set = root(() =>
      createReactiveSet<number>(async function* (draft) {
        draft.add(1);
        yield;
        await a.promise;
        yield new Set([2]);
        await b.promise;
        draft.add(3);
      }),
    );
    await tick();
    expect([...set]).toEqual([1]);
    a.resolve();
    await tick();
    expect([...set]).toEqual([2]);
    b.resolve();
    await tick();
    expect([...set]).toEqual([2, 3]);
  });

  it("forwards generator cleanup and guards a disposed draft", async () => {
    const gate = deferred();
    let closed = false;
    let dispose!: () => void;
    const set = createRoot(d => {
      dispose = d;
      return createReactiveSet<number>(async function* (draft) {
        try {
          draft.add(1);
          yield;
          await gate.promise;
          draft.add(2);
          yield;
        } finally {
          closed = true;
        }
      });
    });
    await tick();
    dispose();
    gate.resolve();
    await tick();
    expect(closed).toBe(true);
    expect([...set]).toEqual([1]);
  });

  it("exposes refresh and pending status through its projection", async () => {
    const gates = [deferred(), deferred(), deferred()];
    let runs = 0;
    const [revision, update] = createSignal(0);
    const set = root(() =>
      createReactiveSet<number>(async () => {
        revision();
        const run = runs++;
        await gates[run].promise;
        return new Set([run]);
      }),
    );
    root(() => observe(() => [...set]));
    const pendingState = root(() => observe(() => isPending(() => set.has(0))));
    gates[0].resolve();
    await tick();
    const pending = refresh(set);
    flush();
    // Explicit refresh is a quiet re-ask in Solid 2; a new source question
    // below is transition-pending instead. Preserve both core semantics.
    expect(isPending(() => set.has(0))).toBe(false);
    gates[1].resolve();
    await pending;
    await tick();
    expect([...set]).toEqual([1]);
    expect(isPending(() => set.has(1))).toBe(false);
    update(1);
    flush();
    expect(pendingState.values.at(-1)).toBe(true);
    gates[2].resolve();
    await tick();
    expect([...set]).toEqual([2]);
    expect(pendingState.values.at(-1)).toBe(false);
  });

  it("keeps held truth isolated, including first reads of previously unread entries", async () => {
    const gate = deferred();
    const [value, change] = createSignal(0);
    const map = root(() =>
      createReactiveMap(
        () =>
          new Map([
            ["a", value()],
            ["unread", value()],
          ]),
      ),
    );
    const reader = root(() => observe(() => map.get("a")));
    flush();
    const held = action(function* () {
      yield gate.promise;
    })();
    change(1);
    flush();
    expect(map.get("a")).toBe(0);
    expect(map.get("unread")).toBe(0);
    expect(reader.values).toEqual([0]);
    expect(latest(() => map.get("a"))).toBe(1);
    gate.resolve();
    await held;
    await tick();
    expect(map.get("unread")).toBe(1);
    expect(reader.values).toEqual([0, 1]);
  });

  it("rolls back disjoint optimistic value edits independently", async () => {
    const map = root(() =>
      createReactiveMap(
        [
          ["a", 1],
          ["b", 2],
        ],
        { optimistic: true },
      ),
    );
    const gates = [deferred(), deferred()];
    const edit = (key: string, value: number, gate: Promise<void>) =>
      action(function* () {
        map.set(key, value);
        yield gate;
      })();
    const a = edit("a", 10, gates[0].promise);
    flush();
    const b = edit("b", 20, gates[1].promise);
    flush();
    expect([...map]).toEqual([
      ["a", 10],
      ["b", 20],
    ]);
    gates[1].resolve();
    await b;
    await tick();
    expect([...map]).toEqual([
      ["a", 10],
      ["b", 2],
    ]);
    gates[0].resolve();
    await a;
    await tick();
    expect([...map]).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("keeps optimistic structural reads coherent without prior subscribers", async () => {
    const set = root(() => createReactiveSet([1, 2], { optimistic: true }));
    const gate = deferred();
    const pending = action(function* () {
      set.clear();
      set.add(3);
      yield gate.promise;
    })();
    flush();
    expect([...set]).toEqual([3]);
    expect(set.size).toBe(1);
    expect(set.has(1)).toBe(false);
    expect(set.has(3)).toBe(true);
    gate.resolve();
    await pending;
    await tick();
    expect([...set]).toEqual([1, 2]);
    expect(set.size).toBe(2);
    expect(set.has(1)).toBe(true);
    expect(set.has(3)).toBe(false);
  });

  it("coordinates overlapping structural actions through shared order and size slots", async () => {
    const set = root(() => createReactiveSet<number>([], { optimistic: true }));
    const gates = [deferred(), deferred()];
    const add = (key: number, gate: Promise<void>) =>
      action(function* () {
        set.add(key);
        yield gate;
      })();
    const a = add(1, gates[0].promise);
    flush();
    const b = add(2, gates[1].promise);
    flush();
    gates[0].resolve();
    await tick();
    // Collections inherit store overlap semantics: structural
    // actions share order/size slots and settle together, unlike value-only
    // edits to independent Map entries. Pin the limitation and view coherence.
    expect([...set]).toEqual([1, 2]);
    expect(set.size).toBe(2);
    expect(set.has(1) && set.has(2)).toBe(true);
    gates[1].resolve();
    await Promise.all([a, b]);
    await tick();
    expect([...set]).toEqual([]);
    expect(set.size).toBe(0);
    expect(set.has(1) || set.has(2)).toBe(false);
  });

  it("keeps optimistic values until an authoritative refetch lands", async () => {
    const gates = [deferred(), deferred()];
    const [run, next] = createSignal(0);
    const map = root(() =>
      createReactiveMap<string, number>(
        async () => {
          const i = run();
          await gates[i].promise;
          return new Map([["a", i]]);
        },
        { optimistic: true },
      ),
    );
    root(() => observe(() => map.get("a")));
    gates[0].resolve();
    await tick();
    next(1);
    map.set("a", 10);
    flush();
    expect(map.get("a")).toBe(10);
    gates[1].resolve();
    await tick();
    expect(map.get("a")).toBe(1);
  });
});
