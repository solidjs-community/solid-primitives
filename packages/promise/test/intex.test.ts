import { createRoot, createSignal, flush, onCleanup } from "solid-js";
import { describe, test, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { until, untilAll, untilAny, changed, promiseTimeout, raceTimeout, retry } from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("promiseTimeout", () => {
  test("resolves after timeout", async () => {
    let done = false;
    promiseTimeout(100).then(() => (done = true));
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(100);
    expect(done).toBe(true);
  });

  test("rejects after timeout", async () => {
    let done: unknown;
    const reason = new Error("promiseTimeout rejection reason");
    promiseTimeout(100, true, reason)
      .then(() => (done = true))
      .catch(r => (done = r));
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(100);
    expect(done).toBe(reason);
  });
});

describe("raceTimeout", () => {
  test("resolves after timeout", async () => {
    let done = false;
    raceTimeout([promiseTimeout(200)], 100).then(() => (done = true));
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(100);
    expect(done).toBe(true);
  });

  test("resolves before timeout", async () => {
    let done: unknown;
    const result = "raceTimeout result";
    raceTimeout([new Promise(() => {}), promiseTimeout(100).then(() => result)], 200).then(
      res => (done = res),
    );
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(100);
    expect(done).toBe(result);
  });

  test("rejects after timeout", async () => {
    let done: unknown;
    const reason = new Error("raceTimeout rejection reason");
    raceTimeout([promiseTimeout(200)], 100, true, reason)
      .then(() => (done = true))
      .catch(r => (done = r));
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(50);
    expect(done).toBe(undefined);
    await vi.advanceTimersByTimeAsync(100);
    expect(done).toBe(reason);
  });

  // test("rejects before timeout", async () => {
  //   let done: unknown;
  //   const reason = new Error("raceTimeout rejection reason");
  //   const rejectetPromise = Promise.reject();  //vitest complains about unhandled promises, even though it is handled later
  //   raceTimeout([rejectetPromise], 100).then(
  //     () => (done = true),
  //     r => (done = r),
  //   );
  //   await vi.advanceTimersByTimeAsync(50);
  //   expect(done).toBe(reason);
  // });
});

describe("until", () => {
  test("awaits reactive condition", async () => {
    const [state, setState] = createSignal(false);
    let done: unknown;

    const dispose = createRoot(dispose => {
      until(state).then(res => (done = res));
      return dispose;
    });

    expect(done).toBe(undefined);

    setState(true);
    flush();
    expect(done).toBe(undefined); // promise .then is still a microtask

    await Promise.resolve();
    expect(done).toBe(true);

    dispose();
  });

  test("computation stops when root disposes", async () => {
    const [state, setState] = createSignal(false);
    let value = false;
    let threw = false;

    const dispose = createRoot(dispose => {
      until(state)
        .then(() => (value = true))
        .catch(() => (threw = true));

      return dispose;
    });

    dispose();
    setState(true);

    await Promise.resolve();
    await Promise.resolve();

    expect(value).toBe(false);
    expect(threw).toBe(true);
  });

  test(".dispose() will stop computation", async () => {
    const [state, setState] = createSignal(false);
    let value = false;
    let threw = false;

    const res = until(state);
    res.then(() => (value = true)).catch(() => (threw = true));

    res.dispose();
    setState(true);

    await Promise.resolve();
    await Promise.resolve();

    expect(value).toBe(false);
    expect(threw).toBe(true);
  });

  describe("changed", () => {
    test("resolves after changes", async () => {
      const [count, setCount] = createSignal(0);
      let value: unknown;

      const dispose = createRoot(dispose => {
        until(changed(count, 2)).then(v => (value = v));
        return dispose;
      });

      setCount(1);
      flush();
      expect(value).toBe(undefined);

      setCount(1); // same value — no re-evaluation
      expect(value).toBe(undefined);

      setCount(2);
      flush(); // effect apply runs → resolve(true) called
      await Promise.resolve(); // .then runs → value = true
      expect(value).toBe(true);

      dispose();
    });
  });

  describe("raceTimeout", () => {
    test("computation get's disposed when timeout", async () => {
      let disposed = false;

      raceTimeout(
        until(() => {
          onCleanup(() => (disposed = true));
        }),
        100,
      );

      await vi.advanceTimersByTimeAsync(100);

      expect(disposed).toBe(true);
    });
  });
});

describe("untilAll", () => {
  test("resolves when all conditions are truthy", async () => {
    const [a, setA] = createSignal(false);
    const [b, setB] = createSignal(false);
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAll([a, b]).then(v => (resolved = v));
      return dispose;
    });

    setA(true);
    flush();
    expect(resolved).toBe(undefined); // b is still false

    setB(true);
    flush();
    await Promise.resolve();
    expect(resolved).toEqual([true, true]);

    dispose();
  });

  test("does not resolve when only some conditions are truthy", async () => {
    const [a, setA] = createSignal(false);
    const [b] = createSignal(false);
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAll([a, b])
        .then(v => (resolved = v))
        .catch(() => {}); // dispose() below rejects the pending promise — suppress it
      return dispose;
    });

    setA(true);
    flush();
    await Promise.resolve();
    expect(resolved).toBe(undefined);

    dispose();
  });

  test("resolves with the truthy values of all conditions", async () => {
    const [a, setA] = createSignal(0);
    const [b, setB] = createSignal("");
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAll([a, b]).then(v => (resolved = v));
      return dispose;
    });

    setA(42);
    setB("hello");
    flush();
    await Promise.resolve();
    expect(resolved).toEqual([42, "hello"]);

    dispose();
  });

  test("resolves immediately with an empty conditions array", async () => {
    let resolved: unknown;
    untilAll([]).then(v => (resolved = v));
    await Promise.resolve();
    expect(resolved).toEqual([]);
  });

  test("rejects when the root disposes before all conditions are met", async () => {
    const [a, setA] = createSignal(false);
    let threw = false;

    const dispose = createRoot(dispose => {
      untilAll([a, () => false]).catch(() => (threw = true));
      return dispose;
    });

    dispose();
    await Promise.resolve();
    expect(threw).toBe(true);
  });

  test(".dispose() stops computation", async () => {
    const [a] = createSignal(false);
    let threw = false;

    const p = untilAll([a]);
    p.catch(() => (threw = true));
    p.dispose();

    await Promise.resolve();
    expect(threw).toBe(true);
  });

  test("dispose() is called when raceTimeout fires", async () => {
    const [a] = createSignal(false);
    let rejected = false;

    const p = untilAll([a, () => false]);
    p.catch(() => (rejected = true));
    raceTimeout(p, 100); // start — do not await with fake timers

    await vi.advanceTimersByTimeAsync(100); // fire the fake timer
    expect(rejected).toBe(true); // p was disposed inside raceTimeout.finally
  });
});

describe("untilAny", () => {
  test("resolves when any condition becomes truthy", async () => {
    const [a] = createSignal(false);
    const [b, setB] = createSignal(false);
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAny([a, b]).then(v => (resolved = v));
      return dispose;
    });

    setB(true);
    flush();
    await Promise.resolve();
    expect(resolved).toBe(true);

    dispose();
  });

  test("resolves with the first truthy value", async () => {
    const [a, setA] = createSignal(0);
    const [b] = createSignal(0);
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAny([a, b]).then(v => (resolved = v));
      return dispose;
    });

    setA(42);
    flush();
    await Promise.resolve();
    expect(resolved).toBe(42);

    dispose();
  });

  test("does not resolve while all conditions are falsy", async () => {
    const [a] = createSignal(false);
    const [b] = createSignal(false);
    let resolved: unknown;

    const dispose = createRoot(dispose => {
      untilAny([a, b])
        .then(v => (resolved = v))
        .catch(() => {}); // dispose() below rejects the pending promise — suppress it
      return dispose;
    });

    flush();
    await Promise.resolve();
    expect(resolved).toBe(undefined);

    dispose();
  });

  test("rejects when the root disposes", async () => {
    const [a] = createSignal(false);
    let threw = false;

    const dispose = createRoot(dispose => {
      untilAny([a]).catch(() => (threw = true));
      return dispose;
    });

    dispose();
    await Promise.resolve();
    expect(threw).toBe(true);
  });

  test(".dispose() stops computation", async () => {
    const [a] = createSignal(false);
    let threw = false;

    const p = untilAny([a]);
    p.catch(() => (threw = true));
    p.dispose();

    await Promise.resolve();
    expect(threw).toBe(true);
  });

  test("empty conditions array never resolves, disposes cleanly", async () => {
    let threw = false;

    const p = untilAny([]);
    p.catch(() => (threw = true)); // register directly on p to avoid unhandled rejection

    await Promise.resolve();
    expect(threw).toBe(false); // still pending — nothing triggered a rejection yet

    p.dispose();
    await Promise.resolve();
    expect(threw).toBe(true);
  });
});

describe("retry", () => {
  test("returns the value on the first successful attempt", async () => {
    const result = await retry(() => Promise.resolve(42));
    expect(result).toBe(42);
  });

  test("retries on failure and eventually succeeds", async () => {
    let attempts = 0;
    const result = await retry(() => {
      attempts++;
      if (attempts < 3) throw new Error("fail");
      return Promise.resolve("success");
    });
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  test("rejects after all retries are exhausted", async () => {
    const err = new Error("always fails");
    await expect(retry(() => Promise.reject(err), { times: 3 })).rejects.toBe(err);
  });

  test("respects the times option", async () => {
    let attempts = 0;
    const err = new Error("fail");
    await expect(
      retry(
        () => {
          attempts++;
          return Promise.reject(err);
        },
        { times: 2 },
      ),
    ).rejects.toBe(err);
    expect(attempts).toBe(2);
  });

  test("shouldRetry — stops immediately when it returns false", async () => {
    let attempts = 0;
    const err = new Error("auth error");
    await expect(
      retry(
        () => {
          attempts++;
          return Promise.reject(err);
        },
        { times: 5, shouldRetry: e => (e as Error).message !== "auth error" },
      ),
    ).rejects.toBe(err);
    expect(attempts).toBe(1);
  });

  test("waits for the numeric delay between attempts", async () => {
    let attempts = 0;
    const p = retry(
      () => {
        attempts++;
        if (attempts < 3) throw new Error("fail");
        return Promise.resolve("done");
      },
      { times: 3, delay: 100 },
    );

    expect(attempts).toBe(1); // first attempt ran synchronously before first await
    await vi.advanceTimersByTimeAsync(50);
    expect(attempts).toBe(1); // still in the 100ms delay
    await vi.advanceTimersByTimeAsync(100);
    expect(attempts).toBe(2); // delay elapsed, second attempt ran
    await vi.advanceTimersByTimeAsync(100);
    expect(attempts).toBe(3); // third attempt ran and succeeded

    expect(await p).toBe("done");
  });

  test("calls the delay function with the attempt index for backoff", async () => {
    const seenAttempts: number[] = [];
    let callCount = 0;

    const p = retry(
      () => {
        callCount++;
        if (callCount < 3) throw new Error("fail");
        return Promise.resolve("done");
      },
      { delay: attempt => { seenAttempts.push(attempt); return (attempt + 1) * 100; } },
    );

    await vi.advanceTimersByTimeAsync(100); // delay(0) = 100ms
    await vi.advanceTimersByTimeAsync(200); // delay(1) = 200ms

    expect(await p).toBe("done");
    expect(seenAttempts).toEqual([0, 1]);
  });

  test("does not delay after the last failed attempt", async () => {
    let attempts = 0;
    const delayFn = vi.fn(() => 500);

    // set up the rejection assertion before advancing the timer so p is never unhandled
    const assertion = expect(
      retry(
        () => {
          attempts++;
          throw new Error("fail");
        },
        { times: 2, delay: delayFn },
      ),
    ).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(500);
    await assertion;

    // delay called once: between attempt 0 and 1, NOT after the final failed attempt
    expect(delayFn).toHaveBeenCalledTimes(1);
    expect(delayFn).toHaveBeenCalledWith(0);
  });
});
