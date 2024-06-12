import { createEffect, createResource, createSignal, on } from "solid-js";
import { describe, test, expect, vi, afterAll, beforeEach, beforeAll } from "vitest";
import { testEffect } from "@solidjs/testing-library";

class AbortError extends Error {
  constructor(msg: string) {
    super(msg);
  }
  name = "AbortError";
}

import {
  makeAbortable,
  createAggregated,
  serializer,
  makeCache,
  makeRetrying,
  createDeepSignal,
} from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("makeAbortable", () => {
  test("makes a fetcher abortable", () => {
    const [signal, abort] = makeAbortable();
    const signal1 = signal();
    expect(signal1.aborted, "first signal should not be initially aborted").toBeFalsy();
    const signal2 = signal();
    expect(signal1.aborted, "first signal should be aborted after new request").toBeTruthy();
    expect(signal2, "already aborted signal should not be re-used").not.toBe(signal1);
    expect(signal2.aborted, "second signal should not be initially aborted").toBeFalsy();
    abort();
    expect(signal2.aborted, "signal should be aborted when calling abort()").toBeTruthy();
  });
  test("filters (only) abort errors", async () => {
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

describe("makeAggregated", () => {
  test("aggregates arrays", () =>
    testEffect(done => {
      const [data, addData] = createSignal<string[]>();
      const [resource] = createResource(data, item => Promise.resolve(item));
      const aggregated = createAggregated(resource);
      createEffect((run: number = 0) => {
        if (run === 0) {
          expect(aggregated(), "initially undefined").toBeUndefined();
          addData(["one"]);
        } else if (run === 1) {
          expect(aggregated(), "adding initial data works").toEqual(["one"]);
          addData(["two"]);
        } else if (run === 2) {
          expect(aggregated(), "adding another point of data works").toEqual(["one", "two"]);
          addData(["three", "four"]);
        } else if (run === 3) {
          expect(aggregated(), "adding multiple data points works").toEqual([
            "one",
            "two",
            "three",
            "four",
          ]);
          done();
        }
        return run + 1;
      });
    }));
  test("aggregates objects", () =>
    testEffect(done => {
      const [data, addData] = createSignal<Record<string, string>>();
      const [resource] = createResource(data, item => Promise.resolve(item));
      const aggregated = createAggregated(resource);
      createEffect((run: number = 0) => {
        if (run === 0) {
          expect(aggregated(), "initially undefined").toBeUndefined();
          addData({ one: "one" });
        } else if (run === 1) {
          expect(aggregated(), "adding initial data works").toEqual({ one: "one" });
          addData({ two: "two" });
        } else if (run === 2) {
          expect(aggregated(), "adding another point of data works").toEqual({
            one: "one",
            two: "two",
          });
          addData({ three: "three", four: "four" });
        } else if (run === 3) {
          expect(aggregated(), "adding multiple data points works").toEqual({
            one: "one",
            two: "two",
            three: "three",
            four: "four",
          });
          done();
        }
        return run + 1;
      });
    }));
  test("aggregates strings", () =>
    testEffect(done => {
      const [data, addData] = createSignal<string>();
      const [resource] = createResource(data, item => Promise.resolve(item));
      const aggregated = createAggregated(resource);
      createEffect((run: number = 0) => {
        if (run === 0) {
          expect(aggregated(), "initially undefined").toBeUndefined();
          addData("one ");
        } else if (run === 1) {
          expect(aggregated(), "adding initial data works").toBe("one ");
          addData("two ");
        } else if (run === 2) {
          expect(aggregated(), "adding another point of data works").toBe("one two ");
          addData("three four");
        } else if (run === 3) {
          expect(aggregated(), "adding multiple data points works").toBe("one two three four");
          done();
        }
        return run + 1;
      });
    }));
  test("aggregates numbers", () =>
    testEffect(done => {
      const [data, addData] = createSignal<number>();
      const [resource] = createResource(data, item => Promise.resolve(item));
      const aggregated = createAggregated(resource);
      createEffect((run: number = 0) => {
        if (run === 0) {
          expect(aggregated(), "initially undefined").toBeUndefined();
          addData(1);
        } else if (run === 1) {
          expect(aggregated(), "adding initial data works").toEqual([1]);
          addData(2);
        } else if (run === 2) {
          expect(aggregated(), "adding another point of data works").toEqual([1, 2]);
          done();
        }
        return run + 1;
      });
    }));
  test("an initial value [] allows to aggregate objects into arrays", () =>
    testEffect(done => {
      const [data, addData] = createSignal<Record<string, string>>();
      const [resource] = createResource(data, item => Promise.resolve(item));
      const aggregated = createAggregated(resource, []);
      createEffect((run: number = 0) => {
        if (run === 0) {
          expect(aggregated(), "initial value").toEqual([]);
          addData({ one: "one" });
        } else if (run === 1) {
          expect(aggregated(), "adding initial data works").toEqual([{ one: "one" }]);
          addData({ two: "two" });
        } else if (run === 2) {
          expect(aggregated(), "adding another point of data works").toEqual([
            { one: "one" },
            { two: "two" },
          ]);
          done();
        }
        return run + 1;
      });
    }));
});

describe("serializer", () => {
  test("works on undefined, null, booleans, numbers, bignum", () => {
    expect(serializer(undefined)).toBe("undefined");
    expect(serializer(null)).toBe("null");
    expect(serializer(false)).toBe("false");
    expect(serializer(0)).toBe("0");
    expect(serializer(1e5)).toBe("100000");
    expect(serializer(123456789n)).toBe("123456789");
  });
  test("works on strings", () => {
    expect(serializer("test")).toBe('"test"');
    expect(serializer("")).toBe('""');
  });
  test("works on arrays", () => {
    expect(serializer(["one", "two"])).toBe('["one","two"]');
  });
  test("works on objects", () => {
    expect(serializer({ x: 1, y: "2", z: [1, 2, 3] })).toBe('{"x":1,"y":"2","z":[1,2,3]}');
  });
  test("works on RequestInit", () => {
    const headers = new Headers();
    headers.set("content-type", "application/json");
    expect(serializer({ url: "test", headers })).toBe(
      '{"url":"test","headers":{"content-type":"application/json"}}',
    );
  });
});

describe("makeCache", () => {
  test("caches results", () =>
    testEffect(done => {
      const fetcher = vi.fn(data => Promise.resolve(data));
      const [url, setUrl] = createSignal();
      const cache = {};
      const [cacheFetcher] = makeCache(fetcher, { cache });
      const [data] = createResource(url, cacheFetcher);
      createEffect((run: number = 0) => {
        data();
        if (run === 0) {
          setUrl("test");
        } else if (run === 1) {
          expect(data()).toBe("test");
          expect(fetcher).toHaveBeenCalledTimes(1);
          setUrl("test2");
        } else if (run === 2) {
          expect(data()).toBe("test2");
          expect(fetcher).toHaveBeenCalledTimes(2);
          setUrl("test");
        } else if (run === 3) {
          expect(data()).toBe("test");
          expect(fetcher).toHaveBeenCalledTimes(2);
          done();
        }
        return run + 1;
      });
    }));
  test("persists cache", () =>
    testEffect(done => {
      const now = +new Date();
      const storageMock = {
        getItem: () =>
          '{ "\\"test\\"": { "source": "test", "data": "test2", "ts": ' + (now + 10000) + " } }",
        setItem: vi.fn(),
      } as unknown as Storage;
      const cache = {};
      const [url, setUrl] = createSignal<string>();
      const [fetcher, invalidate] = makeCache(data => Promise.resolve(data), {
        cache,
        storage: storageMock,
      });
      const [data] = createResource(url, fetcher);
      createEffect((run: number = 0) => {
        data();
        if (run === 0) {
          expect(cache).toEqual(JSON.parse(storageMock.getItem("solid-cache")!));
          setUrl("test");
        } else if (run === 1) {
          expect(data()).toBe("test2");
          invalidate("test");
          setUrl("solid");
        } else if (run === 2) {
          expect(data()).toBe("solid");
          expect(storageMock.setItem).toBeCalledWith("solid-cache", JSON.stringify(cache));
          done();
        }
        return run + 1;
      });
    }));
  test("invalidates cache", () =>
    testEffect(done => {
      const cache = {};
      const getData = vi.fn(() => Promise.resolve("data"));
      const [fetcher, invalidate] = makeCache(getData, { cache, expires: 1000 });
      const [data, { refetch, mutate }] = createResource(fetcher);
      createEffect((run: number = 0) => {
        data();
        if (run === 1) {
          expect(getData).toHaveBeenCalledOnce();
          expect(cache, "data is cached").toHaveProperty("true");
          vi.advanceTimersToNextTimer();
          expect(cache, "automatic invalidation").not.toHaveProperty("true");
          mutate("invalidated");
          refetch();
        } else if (run === 2) {
          expect(getData).toHaveBeenCalledTimes(2);
        } else if (run === 3) {
          expect(cache, "cache is filled again").toHaveProperty("true");
          invalidate();
          expect(cache, "manual invalidation").not.toHaveProperty("true");
          done();
        }
        return run + 1;
      });
    }));
  test("provides an accessor for automatically invalidated results", () =>
    testEffect(done => {
      const cache = {};
      const getData = () => Promise.resolve(Math.random());
      const [fetcher, _, invalidated] = makeCache(getData, { cache, expires: 1000 });
      const [data, { refetch }] = createResource(fetcher);
      createEffect((run: number = 0) => {
        data();
        if (run === 0) {
          expect(invalidated()).toBeUndefined();
        } else if (run === 1) {
          vi.advanceTimersToNextTimer();
          refetch();
        } else if (run === 2) {
          expect(invalidated()).toHaveProperty("source", true);
          done();
        }
        return run + 1;
      });
    }));
});

describe("makeRetrying", () => {
  test("retries the request after a delay", () =>
    testEffect(done => {
      const responses = [
        Promise.reject(new Error("1")),
        Promise.reject(new Error("2")),
        Promise.resolve("works"),
      ];
      const fetcher = vi.fn(() => responses.shift());
      const [data] = createResource(makeRetrying(fetcher, { delay: 0 }));
      createEffect((run: number = 0) => {
        expect(data.error).toBeUndefined();
        data();
        if (run === 0) {
          expect(fetcher).toHaveBeenCalledOnce();
        } else if (run === 1) {
          expect(fetcher).toHaveBeenCalledTimes(3);
          expect(data()).toBe("works");
          done();
        }
        return run + 1;
      });
    }));
  test("throws after the configured number of retries", () =>
    testEffect(done => {
      const responses = [
        Promise.reject(new Error("1")),
        Promise.reject(new Error("2")),
        Promise.resolve("works"),
      ];
      const fetcher = vi.fn(() => responses.shift());
      const [data] = createResource(makeRetrying(fetcher, { delay: 0, retries: 1 }));
      createEffect((run: number = 0) => {
        !data.error && data();
        if (run === 0) {
          expect(fetcher).toHaveBeenCalledOnce();
        } else if (run === 1) {
          expect(fetcher).toHaveBeenCalledTimes(2);
          expect(data.error).toEqual(new Error("2"));
          done();
        }
        return run + 1;
      });
    }));
});

describe("createDeepSignal", () => {
  test("provides resources with fine-grained reactivity", () =>
    testEffect(done => {
      const responses = [
        { x: "test", y: "test" },
        { x: "test2", y: "test" },
        { x: "test3", y: "test2" },
      ];
      const [answers, setAnswers] = createSignal<{ x: string[]; y: string[] }>({ x: [], y: [] });
      const fetcher = () => Promise.resolve(responses.shift());
      const [data, { refetch }] = createResource(fetcher, { storage: createDeepSignal });
      createEffect(
        on(
          () => data()?.x,
          answer => answer && setAnswers(a => ({ x: [...a.x, answer], y: a.y })),
        ),
      );
      createEffect(
        on(
          () => data()?.y,
          answer => answer && setAnswers(a => ({ x: a.x, y: [...a.y, answer] })),
        ),
      );
      createEffect(() => {
        data();
        data()?.x;
        data()?.y;
        if (responses.length) {
          refetch();
        }
      });
      createEffect((run: number = 0) => {
        answers();
        if (run === 3) {
          expect(answers()).toEqual({ x: ["test", "test2", "test3"], y: ["test", "test2"] });
          done();
        }
        return run + 1;
      });
    }));
});
