import { afterAll, bench, describe } from "vitest";
import { createRoot, createEffect, flush } from "solid-js";
import { createReactiveMap, createReactiveSet } from "../../src/index.js";

const options = { time: 250, warmupTime: 100 };
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
