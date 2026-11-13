import { afterEach, describe, expect, it } from "vitest";
import {
  $TARGET,
  action,
  createEffect,
  createRoot,
  createSignal,
  flush,
  isPending,
  latest,
  NotReadyError,
  refresh,
} from "@solidjs/signals";
import { createReactiveWeakMap, createReactiveWeakSet } from "@solid-primitives/collections";

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
function gate<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
function observe<T>(fn: () => T) {
  let runs = 0;
  const values: T[] = [];
  createEffect(
    () => {
      runs++;
      return fn();
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

describe("weak collection store slots", () => {
  it("allocates independent lazy nodes for membership and value", () => {
    const a = {},
      b = {};
    const map = root(() => createReactiveWeakMap([[a, 1]]));
    const state = (map as any).data.state[$TARGET];
    expect(state.n).toBeNull();
    expect(state.h).toBeNull();
    expect(map.has(a)).toBe(true);
    expect(map.get(a)).toBe(1);
    expect(state.n).toBeNull();
    expect(state.h).toBeNull();
    const [ha, va, hb, vb] = root(() => [
      observe(() => map.has(a)),
      observe(() => map.get(a)),
      observe(() => map.has(b)),
      observe(() => map.get(b)),
    ]);
    flush();
    expect(Object.keys(state.n)).toHaveLength(2);
    expect(Object.keys(state.h)).toHaveLength(2);
    map.set(a, 2);
    flush();
    expect([ha.runs, va.runs, hb.runs, vb.runs]).toEqual([1, 2, 1, 1]);
    map.set(b, 3);
    flush();
    expect([ha.runs, va.runs, hb.runs, vb.runs]).toEqual([1, 2, 2, 2]);
  });

  it("preserves undefined membership, identity and unchanged-value equality", () => {
    const key = {},
      value = { key },
      fn = () => key;
    const map = root(() => createReactiveWeakMap<object, unknown>());
    const reader = root(() => observe(() => map.get(key)));
    flush();
    map.set(key, undefined);
    flush();
    expect(map.has(key)).toBe(true);
    expect(reader.runs).toBe(1);
    map.delete(key);
    flush();
    expect(reader.runs).toBe(1);
    for (const item of [value, fn, NaN, Symbol("value")]) {
      map.set(key, item);
      flush();
      expect(map.get(key)).toBe(item);
      const before = reader.runs;
      map.set(key, item);
      flush();
      expect(reader.runs).toBe(before);
    }
    expect(Object.keys(map)).toEqual([]);
  });

  it("supports native weak key types and rejects invalid writes", () => {
    const local = Symbol("local"),
      fn = () => {};
    const map = root(() =>
      createReactiveWeakMap<WeakKey, number>([
        [local, 1],
        [fn, 2],
      ]),
    );
    expect(map.get(local)).toBe(1);
    expect(map.get(fn)).toBe(2);
    for (const key of [null, 1, "x", Symbol.for("registered")]) {
      expect(() => map.set(key as never, 3)).toThrow(TypeError);
      expect(map.has(key as never)).toBe(false);
      expect(map.get(key as never)).toBeUndefined();
      expect(map.delete(key as never)).toBe(false);
    }
  });

  it("supports reactive WeakSet membership and draft mutations", () => {
    const a = {},
      b = {};
    const [which, update] = createSignal(false);
    const set = root(() =>
      createReactiveWeakSet<object>(draft => {
        draft.delete(which() ? a : b);
        draft.add(which() ? b : a);
      }),
    );
    const [ra, rb] = root(() => [observe(() => set.has(a)), observe(() => set.has(b))]);
    flush();
    expect([set.has(a), set.has(b)]).toEqual([true, false]);
    update(true);
    flush();
    expect([ra.values, rb.values]).toEqual([
      [true, false],
      [false, true],
    ]);
    expect(set.add(a)).toBe(set);
    flush();
    expect(set.has(a)).toBe(true);
  });

  it("replaces from an iterable and tracks only entries whose value changes", () => {
    const a = {},
      b = {};
    const [value, update] = createSignal(0);
    const map = root(() =>
      createReactiveWeakMap(
        () =>
          [
            [a, value()],
            [b, 2],
          ] as const,
      ),
    );
    const [ra, rb] = root(() => [observe(() => map.get(a)), observe(() => map.get(b))]);
    flush();
    update(1);
    flush();
    expect(ra.values).toEqual([0, 1]);
    expect(rb.runs).toBe(1);
  });

  for (const optimistic of [false, true]) {
    it(`reads raw keys/values through async drafts, optimistic=${optimistic}`, async () => {
      const key = {},
        value = Object.freeze({ key }),
        pending = gate();
      const map = root(() =>
        createReactiveWeakMap<object, typeof value>(
          async draft => {
            draft.set(key, value);
            expect(draft.get(key)).toBe(value);
            await pending.promise;
            expect(draft.get(key)).toBe(value);
          },
          { optimistic },
        ),
      );
      expect(() => map.has(key)).toThrow(NotReadyError);
      pending.resolve();
      await tick();
      expect(map.get(key)).toBe(value);
    });

    it(`isolates loading seeds from partial drafts, optimistic=${optimistic}`, async () => {
      const key = {},
        pending = gate();
      const map = root(() =>
        createReactiveWeakMap<object, number>(
          async draft => {
            expect(draft.get(key)).toBe(0);
            draft.set(key, 1);
            await pending.promise;
            draft.set(key, 2);
          },
          { optimistic, loadingValue: [[key, 0]] },
        ),
      );
      const reader = root(() => observe(() => map.get(key)));
      flush();
      expect(map.get(key)).toBe(0);
      pending.resolve();
      await tick();
      expect(map.get(key)).toBe(2);
      expect(reader.values).toEqual([0, 2]);
    });

    it(`propagates pending and rejects superseded draft writes, optimistic=${optimistic}`, async () => {
      const key = {},
        gates = [gate(), gate()];
      const [phase, update] = createSignal(0);
      const map = root(() =>
        createReactiveWeakMap<object, number>(
          draft => {
            const current = phase();
            if (current === 0) {
              draft.set(key, 0);
              return;
            }
            return gates[current - 1]!.promise.then(() => {
              draft.set(key, current);
            });
          },
          { optimistic },
        ),
      );
      const reader = root(() => observe(() => map.get(key)));
      flush();
      update(1);
      flush();
      expect(isPending(() => map.get(key))).toBe(true);
      update(2);
      flush();
      gates[1]!.resolve();
      await tick();
      expect(map.get(key)).toBe(2);
      expect(isPending(() => map.get(key))).toBe(false);
      gates[0]!.resolve();
      await tick();
      expect(map.get(key)).toBe(2);
      expect(reader.values).toEqual([0, 2]);
    });

    it(`ignores draft mutations after owner disposal, optimistic=${optimistic}`, async () => {
      const key = {},
        pending = gate();
      let map!: WeakMap<object, number>;
      const dispose = createRoot(dispose => {
        map = createReactiveWeakMap<object, number>(
          async draft => {
            await pending.promise;
            draft.set(key, 2);
          },
          { optimistic, loadingValue: [[key, 0]] },
        );
        return dispose;
      });
      dispose();
      pending.resolve();
      await tick();
      expect(map.get(key)).toBe(0);
    });

    it(`supports streaming drafts and terminal edits, optimistic=${optimistic}`, async () => {
      const a = {},
        b = {},
        pending = gate();
      const set = root(() =>
        createReactiveWeakSet<object>(
          async function* (draft) {
            draft.add(a);
            yield;
            await pending.promise;
            draft.delete(a);
            draft.add(b);
          },
          { optimistic },
        ),
      );
      const reader = root(() => observe(() => [set.has(a), set.has(b)]));
      await tick();
      expect([set.has(a), set.has(b)]).toEqual([true, false]);
      pending.resolve();
      await tick();
      expect([set.has(a), set.has(b)]).toEqual([false, true]);
      expect(reader.values.at(-1)).toEqual([false, true]);
    });
  }

  it("keeps held truth isolated for observed and previously unread keys", async () => {
    const a = {},
      b = {},
      pending = gate();
    const [value, update] = createSignal(0);
    const map = root(() =>
      createReactiveWeakMap(
        () =>
          [
            [a, value()],
            [b, value()],
          ] as const,
      ),
    );
    const reader = root(() => observe(() => map.get(a)));
    flush();
    const held = action(function* () {
      yield pending.promise;
    })();
    update(1);
    flush();
    expect(map.get(a)).toBe(0);
    expect(map.get(b)).toBe(0);
    expect(latest(() => map.get(b))).toBe(1);
    expect(reader.values).toEqual([0]);
    pending.resolve();
    await held;
    await tick();
    expect(map.get(b)).toBe(1);
  });

  it("keeps overlapping structural actions coherent through shared store settlement", async () => {
    const a = {},
      b = {},
      gates = [gate(), gate()];
    const map = root(() => createReactiveWeakMap([[a, 1]], { optimistic: true }));
    const first = action(function* () {
      map.delete(a);
      yield gates[0]!.promise;
    })();
    flush();
    const second = action(function* () {
      map.set(b, 2);
      yield gates[1]!.promise;
    })();
    flush();
    expect(map.has(a)).toBe(false);
    expect(map.get(b)).toBe(2);
    gates[1]!.resolve();
    await tick();
    // Optimistic stores share an internal key-set slot even with no iterator.
    // Distinct membership edits therefore settle together, like strong maps.
    expect(map.has(a)).toBe(false);
    expect(map.has(b)).toBe(true);
    gates[0]!.resolve();
    await Promise.all([first, second]);
    await tick();
    expect(map.get(a)).toBe(1);
    expect(map.has(b)).toBe(false);
  });

  it("settles optimistic value edits to existing keys independently", async () => {
    const a = {},
      b = {},
      gates = [gate(), gate()];
    const map = root(() =>
      createReactiveWeakMap(
        [
          [a, 1],
          [b, 2],
        ],
        { optimistic: true },
      ),
    );
    const first = action(function* () {
      map.set(a, 10);
      yield gates[0]!.promise;
    })();
    flush();
    const second = action(function* () {
      map.set(b, 20);
      yield gates[1]!.promise;
    })();
    flush();
    gates[1]!.resolve();
    await second;
    await tick();
    expect(map.get(a)).toBe(10);
    expect(map.get(b)).toBe(2);
    gates[0]!.resolve();
    await first;
    await tick();
    expect(map.get(a)).toBe(1);
  });

  it("retains optimism until authoritative refetch lands", async () => {
    const key = {},
      gates = [gate(), gate()];
    const [phase, update] = createSignal(0);
    const map = root(() =>
      createReactiveWeakMap<object, number>(
        async draft => {
          const current = phase();
          await gates[current]!.promise;
          draft.set(key, current);
        },
        { optimistic: true },
      ),
    );
    root(() => observe(() => map.get(key)));
    gates[0]!.resolve();
    await tick();
    update(1);
    map.set(key, 10);
    flush();
    expect(map.get(key)).toBe(10);
    gates[1]!.resolve();
    await tick();
    expect(map.get(key)).toBe(1);
  });

  it("refreshes computed entries", async () => {
    const key = {};
    let version = 0;
    const map = root(() =>
      createReactiveWeakMap<object, number>(draft => {
        draft.set(key, version);
      }),
    );
    root(() => observe(() => map.get(key)));
    flush();
    version = 1;
    await refresh(map);
    await tick();
    expect(map.get(key)).toBe(1);
  });

  it("surfaces rejected computes and recovers on refresh", async () => {
    const key = {};
    let fail = true;
    const map = root(() =>
      createReactiveWeakMap<object, number>(async draft => {
        if (fail) throw new Error("weak failure");
        draft.set(key, 1);
      }),
    );
    await tick();
    expect(() => map.get(key)).toThrow("weak failure");
    fail = false;
    await refresh(map);
    await tick();
    expect(map.get(key)).toBe(1);
  });
});
