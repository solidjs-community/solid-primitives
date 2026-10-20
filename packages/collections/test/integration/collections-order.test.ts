import { afterEach, describe, expect, it } from "vitest";
import { action, createEffect, createRoot, createSignal, flush } from "solid-js";
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
  flush();
});

describe("ordered collections", () => {
  for (const kind of ["keys", "values", "entries"] as const) {
    it(`Map.${kind} observes delete, overwrite, append and reinsertion`, () => {
      const map = root(() =>
        createReactiveMap<string, number>([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]),
      );
      const native = new Map(map);
      const actual = map[kind](),
        expected = native[kind]();
      expect(actual.next()).toEqual(expected.next());
      for (const m of [map, native]) {
        m.delete("b");
        m.set("c", 30);
        m.set("d", 4);
        m.delete("a");
        m.set("a", 5);
      }
      flush();
      expect([...actual]).toEqual([...expected]);
    });
  }
  it("Set iterators observe clear/reinsert and remain done after exhaustion", () => {
    const set = root(() => createReactiveSet([1, 2]));
    const iterator = set.values();
    expect(iterator.next().value).toBe(1);
    set.clear();
    set.add(3);
    flush();
    expect([...iterator]).toEqual([3]);
    set.add(4);
    flush();
    expect(iterator.next().done).toBe(true);
  });
  it("tracks consumption, including iterators created outside the observer", () => {
    const map = root(() => createReactiveMap([["a", 1]]));
    const iterator = map.values();
    let creationRuns = 0,
      readRuns = 0;
    root(() =>
      createEffect(
        () => {
          creationRuns++;
          return map.values();
        },
        () => {},
      ),
    );
    root(() =>
      createEffect(
        () => {
          readRuns++;
          return iterator.next();
        },
        () => {},
      ),
    );
    flush();
    map.set("a", 2);
    flush();
    expect(creationRuns).toBe(1);
    expect(readRuns).toBe(2);
  });
  it("forEach is live inside a writable draft and validates an empty callback", () => {
    const visited: string[] = [];
    const map = root(() =>
      createReactiveMap<string, number>(draft => {
        draft.set("a", 1);
        draft.set("b", 2);
        draft.forEach((_, key) => {
          visited.push(key);
          if (key === "a") {
            draft.delete("b");
            draft.set("c", 3);
          }
        });
      }),
    );
    expect(visited).toEqual(["a", "c"]);
    expect([...map.keys()]).toEqual(visited);
    const empty = root(() => createReactiveSet());
    expect(() => empty.forEach(null as any)).toThrow(TypeError);
  });
  it("object-key reads do not subscribe to the order index", () => {
    const key = {},
      other = {};
    const map = root(() => createReactiveMap([[key, 1]]));
    let runs = 0;
    root(() =>
      createEffect(
        () => {
          runs++;
          return map.has(key);
        },
        () => {},
      ),
    );
    flush();
    map.set(other, 2);
    flush();
    map.delete(other);
    flush();
    expect(runs).toBe(1);
  });
  it("order-changing replacement starts a fresh cursor generation without changing membership", () => {
    const [source, update] = createSignal(new Set([1, 2]));
    const set = root(() => createReactiveSet(source));
    const iterator = set.values();
    expect(iterator.next().value).toBe(1);
    update(new Set([2, 1]));
    flush();
    expect([...iterator]).toEqual([2, 1]);
  });
  it("keeps a live cursor's progress when an optimistic order rolls back", async () => {
    const set = root(() => createReactiveSet([1, 2], { optimistic: true }));
    const iterator = set.values();
    expect(iterator.next().value).toBe(1);
    let release!: () => void;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const pending = action(function* () {
      set.delete(2);
      set.add(3);
      yield gate;
    })();
    flush();
    expect([...set]).toEqual([1, 3]);
    expect(iterator.next().value).toBe(3);
    release();
    await pending;
    flush();
    expect([...set]).toEqual([1, 2]);
    // Restored entries behind the consumed insertion ordinal are not replayed.
    expect(iterator.next().done).toBe(true);
  });
  it("matches native Maps under deterministic interleaved mutations and cursor reads", () => {
    const actual = root(() => createReactiveMap<number, number>());
    const expected = new Map<number, number>();
    let a = actual.entries(),
      b = expected.entries(),
      seed = 0xabcd;
    const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
    for (let step = 0; step < 2000; step++) {
      const key = random() % 50;
      switch (random() % 7) {
        case 0:
          actual.delete(key);
          expected.delete(key);
          break;
        case 1:
          actual.clear();
          expected.clear();
          break;
        case 2:
          expect(a.next()).toEqual(b.next());
          break;
        case 3:
          a = actual.entries();
          b = expected.entries();
          break;
        default:
          actual.set(key, step);
          expected.set(key, step);
      }
      flush();
      expect([...actual]).toEqual([...expected]);
      expect(actual.size).toBe(expected.size);
    }
  });
  it("matches native collections across mixed keys, batched writes, and concurrent cursors", () => {
    const keys: unknown[] = [
      {},
      {},
      () => {},
      Symbol("local"),
      Symbol.for("global"),
      NaN,
      -0,
      1,
      "1",
      1n,
      true,
      false,
      null,
      undefined,
      "__proto__",
      "size",
      "order",
    ];
    const values: unknown[] = [0, -0, NaN, undefined, {}, () => {}];
    const map = root(() => createReactiveMap<unknown, unknown>());
    const nativeMap = new Map<unknown, unknown>();
    const set = root(() => createReactiveSet<unknown>());
    const nativeSet = new Set<unknown>();
    const cursors = () =>
      [
        [map.keys(), nativeMap.keys()],
        [map.values(), nativeMap.values()],
        [map.entries(), nativeMap.entries()],
        [set.values(), nativeSet.values()],
        [set.entries(), nativeSet.entries()],
      ] as const;
    let active = cursors(),
      seed = 0x12abcdef;
    const random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return seed >>> 0;
    };
    for (let batch = 0; batch < 500; batch++) {
      const edits = 1 + (random() % 6);
      for (let i = 0; i < edits; i++) {
        const key = keys[random() % keys.length];
        switch (random() % 12) {
          case 0:
            map.clear();
            nativeMap.clear();
            set.clear();
            nativeSet.clear();
            break;
          case 1:
          case 2:
          case 3:
            expect(map.delete(key)).toBe(nativeMap.delete(key));
            expect(set.delete(key)).toBe(nativeSet.delete(key));
            break;
          default: {
            const value = values[random() % values.length];
            map.set(key, value);
            nativeMap.set(key, value);
            set.add(key);
            nativeSet.add(key);
          }
        }
      }
      flush();
      for (const [a, b] of active) if (random() % 2) expect(a.next()).toEqual(b.next());
      if (random() % 5 === 0) active = cursors();
      expect([...map]).toEqual([...nativeMap]);
      expect([...set]).toEqual([...nativeSet]);
      expect(map.size).toBe(nativeMap.size);
      expect(set.size).toBe(nativeSet.size);
      for (const key of keys) {
        expect(map.has(key)).toBe(nativeMap.has(key));
        expect(Object.is(map.get(key), nativeMap.get(key))).toBe(true);
        expect(set.has(key)).toBe(nativeSet.has(key));
      }
    }
  });

  it("keeps paused cursors valid through large structural batches", () => {
    const values = Array.from({ length: 512 }, (_, i) => i);
    const actual = root(() => createReactiveSet(values));
    const expected = new Set(values);
    const cursors = Array.from({ length: 8 }, (_, i) => {
      const a = actual.values(),
        b = expected.values();
      for (let n = 0; n < i * 64; n++) expect(a.next()).toEqual(b.next());
      return [a, b] as const;
    });
    for (const set of [actual, expected]) {
      for (let i = 0; i < 512; i += 2) set.delete(i);
      for (let i = 512; i < 768; i++) set.add(i);
    }
    flush();
    for (const [a, b] of cursors) expect([...a]).toEqual([...b]);
  });
});
