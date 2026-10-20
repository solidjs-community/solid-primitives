import { afterEach, describe, expect, it } from "vitest";
import { createEffect, createRoot, createSignal, flush, refresh } from "solid-js";
import { createReactiveMap, createReactiveSet } from "../../src/index.js";

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
  for (let i = 0; i < 40; i++) await Promise.resolve();
  flush();
};
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(r => {
    resolve = r;
  });
  return { promise, resolve };
}

describe("collection value equality", () => {
  for (const [before, after] of [
    [0, -0],
    [-0, 0],
    [NaN, NaN],
  ] as const) {
    for (const derived of [false, true]) {
      it(`${derived ? "replacement" : "set"} preserves ${Object.is(before, -0) ? "-0" : before} -> ${Object.is(after, -0) ? "-0" : after}`, () => {
        const [source, update] = createSignal(new Map([["value", before]]));
        const map = root(() => (derived ? createReactiveMap(source) : createReactiveMap(source())));
        let runs = 0;
        root(() =>
          createEffect(
            () => {
              runs++;
              return map.get("value");
            },
            () => {},
          ),
        );
        flush();
        if (derived) update(new Map([["value", after]]));
        else map.set("value", after);
        flush();
        expect(Object.is(map.get("value"), after)).toBe(true);
        expect(Object.is([...map.values()][0], after)).toBe(true);
        expect(runs).toBe(Object.is(before, after) ? 1 : 2);
      });
    }
  }
});

describe("native cursor behavior", () => {
  for (const kind of ["keys", "values", "entries"] as const) {
    for (const set of [false, true]) {
      it(`${set ? "Set" : "Map"}.${kind} resumes after a break or thrown loop body`, () => {
        const actual = root(() =>
          set
            ? createReactiveSet([1, 2, 3])
            : createReactiveMap([
                [1, 10],
                [2, 20],
                [3, 30],
              ]),
        );
        const expected = set
          ? new Set([1, 2, 3])
          : new Map([
              [1, 10],
              [2, 20],
              [3, 30],
            ]);
        const a = actual[kind](),
          b = expected[kind]();
        for (const value of a) {
          expect(value).toEqual(b.next().value);
          break;
        }
        expect(a.next()).toEqual(b.next());
        expect(() => {
          for (const value of a) {
            expect(value).toEqual(b.next().value);
            throw new Error("stop");
          }
        }).toThrow("stop");
        if (actual instanceof Set) actual.add(4);
        else actual.set(4, 40);
        if (expected instanceof Set) expected.add(4);
        else expected.set(4, 40);
        flush();
        expect(a.next()).toEqual(b.next());
        expect(a.next()).toEqual(b.next());
      });
    }
  }
  it("retains native iterator helpers", () => {
    const set = root(() => createReactiveSet([1, 2, 3]));
    expect(
      set
        .values()
        .map(n => n * 2)
        .toArray(),
    ).toEqual([2, 4, 6]);
    const cursor = set.values();
    expect(cursor.take(1).toArray()).toEqual([1]);
    expect(cursor.next().value).toBe(2);
  });
});

describe("derived async boundaries", () => {
  for (const optimistic of [false, true]) {
    it(`ignores superseded stream writes, replacements, and cleanup edits, optimistic=${optimistic}`, async () => {
      const gates = [deferred(), deferred()];
      const [run, next] = createSignal(0);
      const cleaned: number[] = [];
      const map = root(() =>
        createReactiveMap<string, number>(
          async function* (draft) {
            const i = run();
            try {
              draft.set("initial", i);
              yield;
              await gates[i]!.promise;
              draft.set("late", i);
              yield new Map([["result", i]]);
            } finally {
              draft.set("cleanup", i);
              cleaned.push(i);
            }
          },
          { optimistic },
        ),
      );
      await tick();
      expect([...map]).toEqual([["initial", 0]]);
      next(1);
      flush();
      gates[1]!.resolve();
      await tick();
      expect([...map]).toEqual([
        ["result", 1],
        ["cleanup", 1],
      ]);
      gates[0]!.resolve();
      await tick();
      expect(cleaned.sort()).toEqual([0, 1]);
      expect([...map]).toEqual([
        ["result", 1],
        ["cleanup", 1],
      ]);
    });

    for (const stream of [false, true]) {
      it(`recovers from ${stream ? "a stream failure after a yield" : "a rejected promise"}, optimistic=${optimistic}`, async () => {
        let fail = true;
        const gate = deferred();
        const compute = stream
          ? async function* (draft: Map<string, number>) {
              draft.set("value", 1);
              yield;
              await gate.promise;
              if (fail) throw new Error("source failed");
              draft.set("value", 2);
              return new Map([["ignored terminal return", 99]]);
            }
          : async () => {
              await gate.promise;
              if (fail) throw new Error("source failed");
              return new Map([["value", 2]]);
            };
        const map = root(() => createReactiveMap(compute, { optimistic }));
        await tick();
        if (stream) expect(map.get("value")).toBe(1);
        gate.resolve();
        await tick();
        for (const read of [
          () => map.get("value"),
          () => map.has("value"),
          () => map.size,
          () => [...map],
        ])
          expect(read).toThrow("source failed");
        fail = false;
        await refresh(map);
        await tick();
        expect([...map]).toEqual([["value", 2]]);
      });
    }

    it(`accepts its own draft as a result without replacing order, optimistic=${optimistic}`, () => {
      const [version, update] = createSignal(0);
      const map = root(() =>
        createReactiveMap<string, number>(
          draft => {
            draft.set("a", version()).set("b", 2);
            return draft;
          },
          { optimistic },
        ),
      );
      const cursor = map.keys();
      expect(cursor.next().value).toBe("a");
      update(1);
      flush();
      expect([...cursor]).toEqual(["b"]);
      expect([...map]).toEqual([
        ["a", 1],
        ["b", 2],
      ]);
    });
  }
});
