import { afterEach, describe, expect, it } from "vitest";
import { action, createEffect, createRoot, createSignal, flush } from "solid-js";
import { createReactiveMap, createReactiveSet } from "../../src/index.js";
import { advance, insert, remove, seek, type Order } from "../../src/order.js";
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
  it("balances persistent order paths and keeps old roots valid", () => {
    let tree: Order;
    const roots: Order[] = [];
    const validate = (root: Order, min = -Infinity, max = Infinity): number => {
      if (!root) return 0;
      expect(root.id > min && root.id < max).toBe(true);
      const l = validate(root.left, min, root.id),
        r = validate(root.right, root.id, max);
      expect(Math.abs(l - r)).toBeLessThanOrEqual(1);
      expect(root.height).toBe(1 + Math.max(l, r));
      return root.height;
    };
    for (let i = 0; i < 512; i++) {
      tree = insert(tree, i, String(i));
      if (i % 64 === 63) roots.push(tree);
    }
    for (let i = 0; i < 512; i += 2) tree = remove(tree!, i);
    validate(tree);
    for (let i = 0; i < roots.length; i++) {
      validate(roots[i]);
      const stack: any[] = [];
      seek(roots[i], -1, stack);
      const values: number[] = [];
      let item;
      while ((item = advance(stack))) values.push(item.id);
      expect(values).toEqual(Array.from({ length: (i + 1) * 64 }, (_, n) => n));
    }
  });
});
