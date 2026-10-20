import { performance } from "node:perf_hooks";
import { createRoot, createEffect, createSignal, flush } from "solid-js";
import { createReactiveMap, createReactiveSet } from "../../src/index.js";

const options = { time: 250, warmupTime: 100 };
const cases: { suite: string; name: string; fn: () => unknown; options: typeof options }[] = [];
const cleanups: (() => void)[] = [];
let suite = "";
function describe(name: string, fn: () => void) {
  suite = name;
  fn();
}
function afterAll(fn: () => void) {
  cleanups.push(fn);
}
function bench(name: string, fn: () => unknown, options: { time: number; warmupTime: number }) {
  cases.push({ suite, name, fn, options });
}
for (const size of [10, 1000, 10000]) {
  describe(`${size} entries: delete/reinsert`, () => {
    const keys = Array.from({ length: size }, (_, i) => i);
    for (const [name, set] of [
      ["native Set", new Set(keys)],
      ["reactive Set + flush", createReactiveSet(keys)],
    ] as const) {
      bench(
        name,
        () => {
          set.delete(5);
          set.add(5);
          if (name === "reactive Set + flush") flush();
        },
        options,
      );
    }
  });
}

describe("1000 observed values: one value write + flush", () => {
  const map = createReactiveMap<number, number>(
    Array.from({ length: 1000 }, (_, i) => [i, 0] as const),
  );
  const dispose = createRoot(dispose => {
    for (let i = 0; i < 1000; i++)
      createEffect(
        () => map.get(i),
        () => {},
      );
    return dispose;
  });
  afterAll(dispose);
  flush();
  let n = 0;
  bench(
    "reactive Map",
    () => {
      map.set(500, ++n);
      flush();
    },
    options,
  );
});

describe("1000 keys: full iteration", () => {
  const keys = Array.from({ length: 1000 }, (_, i) => i);
  for (const [name, set] of [
    ["native Set", new Set(keys)],
    ["reactive Set", createReactiveSet(keys)],
  ] as const) {
    bench(
      name,
      () => {
        let sum = 0;
        for (const key of set) sum += key;
        return sum;
      },
      options,
    );
  }
});

describe("1000 object keys: edit and traversal", () => {
  const keys = Array.from({ length: 1000 }, (_, i) => ({ i }));
  const map = createReactiveMap(keys.map((key, i) => [key, i] as const));
  bench(
    "delete/reinsert + flush",
    () => {
      map.delete(keys[500]!);
      map.set(keys[500]!, 500);
      flush();
    },
    options,
  );
  for (const kind of ["keys", "values"] as const) {
    bench(
      kind,
      () => {
        let count = 0;
        for (const value of map[kind]()) if (value !== undefined) count++;
        return count;
      },
      options,
    );
  }
});

for (const optimistic of [false, true]) {
  describe(`1000 entries: derived replacements, optimistic=${optimistic}`, () => {
    for (const reorder of [false, true]) {
      const [source, update] = createSignal(new Map<number, number>());
      const map = createReactiveMap(source, { optimistic });
      let revision = 0;
      bench(
        reorder ? "reordered" : "same order",
        () => {
          revision++;
          const keys = Array.from({ length: 1000 }, (_, i) => i);
          if (reorder && revision % 2) keys.reverse();
          update(new Map(keys.map(key => [key, key === 500 ? revision : 0])));
          flush();
          return map.get(500);
        },
        options,
      );
    }
  });
}

function measure(fn: () => unknown, duration: number): number {
  let operations = 0;
  const start = performance.now();
  let elapsed: number;
  do {
    for (let i = 0; i < 10; i++) fn();
    operations += 10;
    elapsed = performance.now() - start;
  } while (elapsed < duration);
  return elapsed / operations;
}
for (const { suite, name, fn, options } of cases) {
  measure(fn, options.warmupTime);
  const samples = Array.from({ length: 3 }, () => measure(fn, options.time));
  samples.sort((a, b) => a - b);
  process.stdout.write(JSON.stringify({ suite, name, medianMs: samples[1] }) + "\n");
}
for (const cleanup of cleanups) cleanup();
