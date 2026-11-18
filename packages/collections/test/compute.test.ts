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
  for (const prototype of ["cycle", "endless", "throw"] as const)
    it(`keeps a proxied iterable lazy with a ${prototype} prototype probe`, async () => {
      let opened = 0,
        probes = 0;
      const handler: ProxyHandler<object> = {
        getPrototypeOf() {
          probes++;
          if (prototype === "throw") throw new Error("prototype inspection refused");
          return prototype === "cycle" ? source : new Proxy({}, handler);
        },
      };
      const source: AsyncIterable<Map<string, number>> = new Proxy(
        {
          [Symbol.asyncIterator]() {
            opened++;
            return {
              async next() {
                return { done: true as const, value: undefined };
              },
            };
          },
        },
        handler,
      ) as AsyncIterable<Map<string, number>>;
      const adapted = runCompute(
        () => source,
        new Map<string, number>(),
        () => {},
        { revision: 0 },
      ) as AsyncIterable<void>;
      expect(opened).toBe(0);
      expect("next" in adapted).toBe(false);
      expect(probes).toBeLessThanOrEqual(32);
      for await (const _ of adapted) {
        /* consume */
      }
      expect(opened).toBe(1);
    });

  it("recognizes a native generator with an accessor next without reading it early", async () => {
    let reads = 0;
    const source = (async function* () {
      yield new Map([["value", 1]]);
    })();
    const next = source.next;
    Object.defineProperty(source, "next", {
      get() {
        if (++reads > 1) throw new Error("next read twice");
        return next;
      },
    });
    const values: number[] = [];
    const adapted = runCompute(
      () => source,
      new Map<string, number>(),
      value => values.push(value!.get("value")!),
      { revision: 0 },
    ) as AsyncIterableIterator<void>;
    expect(typeof adapted.next).toBe("function");
    expect(reads).toBe(0);
    for await (const _ of adapted) {
      /* consume */
    }
    expect(values).toEqual([1]);
    expect(reads).toBe(1);
  });

  it("caches next on the returned iterator and preserves its receiver", async () => {
    let reads = 0,
      pulls = 0;
    const source = {
      get next() {
        if (++reads > 1) throw new Error("next read twice");
        return async function (this: unknown) {
          expect(this).toBe(source);
          return ++pulls < 3
            ? { done: false as const, value: new Map([["value", pulls]]) }
            : { done: true as const, value: undefined };
        };
      },
    };
    const values: number[] = [];
    const adapted = runCompute(
      () => ({ [Symbol.asyncIterator]: () => source }),
      new Map<string, number>(),
      value => values.push(value!.get("value")!),
      { revision: 0 },
    ) as AsyncIterable<void>;
    for await (const _ of adapted) {
      /* consume */
    }
    expect(values).toEqual([1, 2]);
    expect(reads).toBe(1);
  });

  it("closes an iterator whose initial next getter throws", async () => {
    const error = new Error("next lookup failed");
    let returns = 0;
    const adapted = runCompute(
      () => ({
        [Symbol.asyncIterator]() {
          return {
            get next(): AsyncIterator<Map<string, number>>["next"] {
              throw error;
            },
            async return() {
              returns++;
              return { done: true as const, value: undefined };
            },
          };
        },
      }),
      new Map<string, number>(),
      () => {},
      { revision: 0 },
    ) as AsyncIterable<void>;
    await expect(adapted[Symbol.asyncIterator]().next()).rejects.toBe(error);
    expect(returns).toBe(1);
  });

  it("does not read an unrelated next getter on an ordinary iterable", async () => {
    let opened = 0;
    const adapted = runCompute(
      () => ({
        get next(): never {
          throw new Error("outer next must not be read");
        },
        [Symbol.asyncIterator]() {
          opened++;
          return {
            async next() {
              return { done: true as const, value: undefined };
            },
          };
        },
      }),
      new Map<string, number>(),
      () => {},
      { revision: 0 },
    ) as AsyncIterable<void>;
    expect(opened).toBe(0);
    for await (const _ of adapted) {
      /* consume */
    }
    expect(opened).toBe(1);
  });

  for (const failure of ["pull", "commit"] as const)
    for (const cleanup of ["reject", "pending", "throw"] as const) {
      it(`preserves a ${failure} error when cleanup will ${cleanup}`, async () => {
        const error = new Error("original failure"),
          cleanupError = new Error("cleanup failure");
        let returns = 0;
        const source: AsyncIterableIterator<Map<string, number>> = {
          [Symbol.asyncIterator]() {
            return this;
          },
          next() {
            return failure === "pull"
              ? Promise.reject(error)
              : Promise.resolve({ done: false, value: new Map() });
          },
          return() {
            returns++;
            if (cleanup === "throw") throw cleanupError;
            return cleanup === "reject" ? Promise.reject(cleanupError) : new Promise(() => {});
          },
        };
        const adapter = runCompute(
          () => source,
          new Map(),
          () => {
            throw error;
          },
          { revision: 0 },
        ) as AsyncIterableIterator<void>;
        await expect(adapter.next()).rejects.toBe(error);
        await adapter.return!();
        expect(returns).toBe(1);
      });
    }

  it("does not open an ordinary iterable until it is consumed", async () => {
    let opened = 0;
    const source: AsyncIterable<Map<string, number>> = {
      [Symbol.asyncIterator]() {
        opened++;
        return {
          async next() {
            return { done: true, value: undefined };
          },
        };
      },
    };
    const adapted = runCompute(
      () => source,
      new Map(),
      () => {},
      { revision: 0 },
    ) as AsyncIterable<void>;
    expect(opened).toBe(0);
    expect("next" in adapted).toBe(false);
    const iterator = adapted[Symbol.asyncIterator]();
    expect(opened).toBe(1);
    await iterator.next();
  });

  it("reads a callable initializer's iterator getter only once", () => {
    for (const weak of [false, true]) {
      const key = {};
      let reads = 0;
      const input = Object.defineProperty(() => {}, Symbol.iterator, {
        get() {
          if (++reads > 1) throw new Error("iterator read twice");
          return function* (this: unknown) {
            expect(this).toBe(input);
            yield [key, 1] as const;
          };
        },
      }) as (() => void) & Iterable<readonly [object, number]>;
      createRoot(dispose => {
        try {
          expect((weak ? createReactiveWeakMap(input) : createReactiveMap(input)).get(key)).toBe(1);
          expect(reads).toBe(1);
        } finally {
          dispose();
        }
      });
    }
    for (const weak of [false, true]) {
      const key = {};
      let reads = 0;
      const input = Object.defineProperty(() => {}, Symbol.iterator, {
        get() {
          if (++reads > 1) throw new Error("iterator read twice");
          return function* (this: unknown) {
            expect(this).toBe(input);
            yield key;
          };
        },
      }) as (() => void) & Iterable<object>;
      createRoot(dispose => {
        try {
          expect((weak ? createReactiveWeakSet(input) : createReactiveSet(input)).has(key)).toBe(
            true,
          );
          expect(reads).toBe(1);
        } finally {
          dispose();
        }
      });
    }
  });
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
