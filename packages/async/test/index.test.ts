import { describe, test, expect } from "vitest";
import { createEffect, createMemo, createRoot, createSignal, flush } from "solid-js";
import { fromStream, fromJSONStream, makeAbortable, createAbortable, makeRetrying, createAggregated } from "../src/index.js";

const delay = (ms = 50) => new Promise<void>(resolve => setTimeout(resolve, ms));

describe("fromStream", () => {
  const createStream = (data: string) => new ReadableStream({
    start(controller) {
      const chars = data[Symbol.iterator]();
      const encoder = new TextEncoder();
      const step = () => {
        const { value, done } = chars.next();
        if (done) return controller.close();
        controller.enqueue(encoder.encode(value));
        delay(15).then(step);
      }
      delay().then(step);
    },
    pull(_controller) {},
    cancel: () => {},
  });

  test("streams from response", () => new Promise<void>(resolve => createRoot(dispose => {
    const data = "solid is great!";
    const stream = createMemo(fromStream(() => delay().then(() => {
      return new Response(createStream(data));
    })));

    createEffect(stream, (parts) => {
      expect(data.slice(0, parts.length)).toBe(parts);
      if (parts.length === data.length) {
        queueMicrotask(dispose);
        resolve();
      }
    })
  })), 2000);
  
  test("streams from web stream", () => new Promise<void>(resolve => createRoot(dispose => {
    const data = "solid is great!";
    const stream = createMemo(fromStream(() => delay().then(() => {
      return createStream(data);
    })));

    createEffect(stream, (parts) => {
      expect(data.slice(0, parts.length)).toBe(parts);
      if (parts.length === data.length) {
        queueMicrotask(dispose);
        resolve();
      }
    })
  })), 2000);
});

describe("fromJSONStream", () => {
  const createStream = (data: string[]) => new ReadableStream<Uint8Array>({
    start(controller) {
      const parts = data[Symbol.iterator]();
      const encoder = new TextEncoder();
      const step = () => {
        const { value, done } = parts.next();
        if (done) return controller.close();
        controller.enqueue(encoder.encode(value));
        delay(15).then(step);
      }
      delay().then(step);
    },
    pull(_controller) {},
    cancel: () => {},
  });
  
  test("streams partial JSON from response", () => new Promise<void>(resolve => createRoot(dispose => {
    const data = [
      '{"test": tru',
      'e, "data": [1, 2, ',
      '3], "solid": "is great!"}'
    ];
    const expected = [
      { test: true },
      { test: true, data: [1, 2] },
      { test: true, data: [1, 2, 3], "solid": "is great!" },
    ];
    const stream = createMemo(fromJSONStream(() => createStream(data))); 
    createEffect(stream, (json) => {
      expect(json).toEqual(expected.shift());
      if (!expected.length) {
        queueMicrotask(dispose);
        resolve();
      }
    }) 
  })));
});

describe("makeAbortable", () => {
  test("makes a fetcher abortable", () => {
    const [signal, abort] = makeAbortable();
    const signal1 = signal();
    expect(signal1.aborted, "first signal should not be initially aborted").toBeFalsy();
    const signal2 = signal();
    flush();
    expect(signal1.aborted, "first signal should be aborted after new request").toBeTruthy();
    expect(signal2, "already aborted signal should not be re-used").not.toBe(signal1);
    expect(signal2.aborted, "second signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal2.aborted, "signal should be aborted when calling abort()").toBeTruthy();
  });

  test("aborts on chained signal abort", () => {
    const [sig1, abort] = makeAbortable();
    const [sig2] = makeAbortable({ chainTo: sig1 });
    const signal1 = sig1(), signal2 = sig2();
    expect(signal1.aborted, "first signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal2.aborted, "chained signal was not aborted by the chained signal abort").toBeTruthy();
  });

  test("chained signal does not abort its parent", () => {
    const [sig1] = makeAbortable();
    const [sig2, abort] = makeAbortable({ chainTo: sig1 });
    const signal1 = sig1(), signal2 = sig2();
    expect(signal2.aborted, "second signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal1.aborted, "signal chaining works in the wrong direction").toBeFalsy();
  });

  test("filters (only) abort errors", async () => {
    class AbortError extends Error {
      constructor(msg: string) {
        super(msg);
      }
      name = "AbortError";
    }
    const [_signal, _abort, filterAbortError] = makeAbortable();
    await Promise.reject(new AbortError("test"))
      .catch(filterAbortError)
      .then(resolution => expect(resolution).toBeUndefined())
      .catch(err => expect.fail(err.message || "failed with error"));
    const noAbortError = new Error("not an AbortError");
    await Promise.reject(noAbortError)
      .catch(filterAbortError)
      .then(() => expect.fail("filtered error that was not an AbortError"))
      .catch(err => expect(err).toBe(noAbortError));
  });
});

describe("createAbortable", () => {
  test("aborts on cleanup", () => {
    const [dispose, signal] = createRoot((dispose) => [dispose, createAbortable()[0]()]);
    expect(signal.aborted).toBeFalsy();
    dispose();
    expect(signal.aborted).toBeTruthy();
  });
});

describe("makeRetrying", () => {
  test("makes a fetcher retry in case of error", async () => {
    const responses: Promise<unknown>[] = [Promise.reject(new Error("retry"))];
    const fetcher = (_prev: unknown) => responses.shift() || Promise.resolve(true);
    const wrapped = makeRetrying(fetcher, { delay: 15 });
    expect(await wrapped()[Symbol.asyncIterator]().next()).toEqual({ done: false, value: true });
  });
  
  test("throws after the retry limit", async () => {
  const responses: Promise<unknown>[] = Array.from({ length: 4 }, () => Promise.reject(new Error("retry")));
    const fetcher = (_prev: unknown) => responses.shift() || Promise.resolve(true);
    const wrapped = makeRetrying(fetcher, { delay: 15 });
    const result = wrapped()[Symbol.asyncIterator]().next();
    console.log(result)
    await expect(result).rejects.toThrow();
  });
});

describe("makeAggregated", () => {
  test("aggregates arrays", () =>
    new Promise<void>(resolve => createRoot(dispose => {
      const [data, addData] = createSignal<string[]>();
      const memo = createMemo(() => Promise.resolve(data()));
      const aggregated = createAggregated(memo);
      let run = 0;
      createEffect(aggregated, (aggregate) => {
        if (run === 0) {
          expect(aggregate, "initially undefined").toBeUndefined();
          addData(["one"]);
        } else if (run === 1) {
          expect(aggregate, "adding initial data works").toEqual(["one"]);
          addData(["two"]);
        } else if (run === 2) {
          expect(aggregate, "adding another point of data works").toEqual(["one", "two"]);
          addData(["three", "four"]);
        } else if (run === 3) {
          expect(aggregate, "adding multiple data points works").toEqual([
            "one",
            "two",
            "three",
            "four",
          ]);
          queueMicrotask(dispose);
          resolve();
        }
        run++;
      });
    })));
  test("aggregates objects", () =>
    new Promise<void>(resolve => createRoot(dispose => {
      const [data, addData] = createSignal<Record<string, string>>();
      const memo = createMemo(() => Promise.resolve(data()));
      const aggregated = createAggregated(memo);
      let run = 0;
      createEffect(aggregated, (aggregate) => {
        if (run === 0) {
          expect(aggregate, "initially undefined").toBeUndefined();
          addData({ one: "one" });
        } else if (run === 1) {
          expect(aggregate, "adding initial data works").toEqual({ one: "one" });
          addData({ two: "two" });
        } else if (run === 2) {
          expect(aggregate, "adding another point of data works").toEqual({
            one: "one",
            two: "two",
          });
          addData({ three: "three", four: "four" });
        } else if (run === 3) {
          expect(aggregate, "adding multiple data points works").toEqual({
            one: "one",
            two: "two",
            three: "three",
            four: "four",
          });
          queueMicrotask(dispose);
          resolve();
        }
        run++;
      });
    })));
  test("aggregates strings", () =>
    new Promise<void>(resolve => createRoot(dispose => {
      const [data, addData] = createSignal<string>();
      const memo = createMemo(() => Promise.resolve(data()));
      const aggregated = createAggregated(memo);
      let run = 0;
      createEffect(aggregated, (aggregate) => {
        if (run === 0) {
          expect(aggregate, "initially undefined").toBeUndefined();
          addData("one ");
        } else if (run === 1) {
          expect(aggregate, "adding initial data works").toBe("one ");
          addData("two ");
        } else if (run === 2) {
          expect(aggregate, "adding another point of data works").toBe("one two ");
          addData("three four");
        } else if (run === 3) {
          expect(aggregate, "adding multiple data points works").toBe("one two three four");
          queueMicrotask(dispose);
          resolve();
        }
        run++;
      });
    })));
  test("aggregates numbers", () =>
    new Promise<void>(resolve => createRoot(dispose => {
      const [data, addData] = createSignal<number>();
      const memo = createMemo(() => Promise.resolve(data()));
      const aggregated = createAggregated(memo);
      let run = 0;
      createEffect(aggregated, (aggregate) => {
        if (run === 0) {
          expect(aggregate, "initially undefined").toBeUndefined();
          addData(1);
        } else if (run === 1) {
          expect(aggregate, "adding initial data works").toEqual([1]);
          addData(2);
        } else if (run === 2) {
          expect(aggregate, "adding another point of data works").toEqual([1, 2]);
          queueMicrotask(dispose);
          resolve();
        }
        run++;
      });
    })));
  test("an initial value [] allows to aggregate objects into arrays", () =>
    new Promise<void>(resolve => createRoot(dispose => {
      const [data, addData] = createSignal<Record<string, string>>();
      const memo = createMemo(() => Promise.resolve(data()));
      const aggregated = createAggregated(memo, []);
      let run = 0;
      createEffect(aggregated, (aggregate) => {
        if (run === 0) {
          expect(aggregate, "initial value").toEqual([]);
          addData({ one: "one" });
        } else if (run === 1) {
          expect(aggregate, "adding initial data works").toEqual([{ one: "one" }]);
          addData({ two: "two" });
        } else if (run === 2) {
          expect(aggregate, "adding another point of data works").toEqual([
            { one: "one" },
            { two: "two" },
          ]);
          queueMicrotask(dispose);
          resolve();
        }
        run++;
      });
    })));
});
