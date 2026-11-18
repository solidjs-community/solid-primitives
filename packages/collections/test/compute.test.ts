import { describe, expect, it } from "vitest";
import { createEffect, createRoot, flush, from } from "solid-js";
import {
  createReactiveMap,
  createReactiveSet,
  createReactiveWeakMap,
  createReactiveWeakSet,
} from "../src/index.ts";
import { runCompute } from "../src/compute.ts";

describe("compute source adaptation", () => {
  it("consumes callable iterables without invoking them", () => {
    let calls = 0;
    const key = {};
    const entries = Object.assign(
      () => {
        calls++;
      },
      {
        *[Symbol.iterator]() {
          yield [key, 1] as const;
        },
      },
    );
    const keys = Object.assign(
      () => {
        calls++;
      },
      {
        *[Symbol.iterator]() {
          yield key;
        },
      },
    );
    createRoot(dispose => {
      try {
        expect(createReactiveMap(entries).get(key)).toBe(1);
        expect(createReactiveSet(keys).has(key)).toBe(true);
        expect(createReactiveWeakMap(entries).get(key)).toBe(1);
        expect(createReactiveWeakSet(keys).has(key)).toBe(true);
        expect(calls).toBe(0);
      } finally {
        dispose();
      }
    });
  });
  it("forwards return while next is pending and ignores a late value", async () => {
    let finish!: (value: IteratorResult<Map<string, number>>) => void;
    let returns = 0;
    const values: Map<string, number>[] = [];
    const source: AsyncIterableIterator<Map<string, number>> = {
      [Symbol.asyncIterator]() {
        return this;
      },
      next: () =>
        new Promise(resolve => {
          finish = resolve;
        }),
      async return() {
        returns++;
        return { done: true, value: undefined };
      },
    };
    const adapter = runCompute(
      () => source,
      new Map(),
      value => values.push(value),
      { revision: 0 },
    ) as AsyncIterableIterator<void>;
    const pull = adapter.next();
    const closing = adapter.return!();
    try {
      expect(returns).toBe(1);
      finish({ done: false, value: new Map([["late", 1]]) });
      await closing;
      expect((await pull).done).toBe(true);
      expect(values).toEqual([]);
    } finally {
      finish({ done: true, value: undefined });
      await pull;
      await closing;
    }
  });

  it("unsubscribes a collection with a pending subscription pull on disposal", async () => {
    let disposed = 0;
    let started = 0;
    const dispose = createRoot(dispose => {
      const map = createReactiveMap(() =>
        from<Map<string, number>>(emit => {
          started++;
          emit(new Map([["value", 1]]));
          return () => {
            disposed++;
          };
        }),
      );
      createEffect(
        () => map.get("value"),
        () => {},
      );
      return dispose;
    });
    try {
      flush();
      await expect.poll(() => started).toBe(1);
    } finally {
      dispose();
    }
    await expect.poll(() => disposed).toBe(1);
  });

  it("reads a thenable resolver once and preserves its receiver", async () => {
    let reads = 0;
    const replacement = new Map([["value", 1]]);
    const source = {
      get then() {
        if (++reads > 1) throw new Error("read twice");
        return function (this: unknown, resolve: (value: typeof replacement) => void) {
          expect(this).toBe(source);
          resolve(replacement);
        };
      },
    };
    let value;
    await runCompute(
      () => source as PromiseLike<typeof replacement>,
      new Map(),
      result => {
        value = result;
      },
      { revision: 0 },
    );
    expect(value).toBe(replacement);
    expect(reads).toBe(1);
  });

  it("reads the async iterator method once and preserves its receiver", async () => {
    let reads = 0;
    const replacement = new Map([["value", 1]]);
    const source = {
      get [Symbol.asyncIterator]() {
        if (++reads > 1) throw new Error("read twice");
        return function (this: unknown) {
          expect(this).toBe(source);
          let done = false;
          return {
            async next() {
              if (done) return { done: true as const, value: undefined };
              done = true;
              return { done: false as const, value: replacement };
            },
          };
        };
      },
    };
    let value;
    const adapter = runCompute(
      () => source,
      new Map(),
      result => {
        value = result;
      },
      { revision: 0 },
    ) as AsyncIterableIterator<void>;
    for await (const _ of adapter) {
      /* consume */
    }
    expect(value).toBe(replacement);
    expect(reads).toBe(1);
  });
});
