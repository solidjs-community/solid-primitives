import { createRoot, createSignal, onCleanup } from "solid-js";
import { describe, test, expect, vi, beforeEach, afterAll } from "vitest";
import { until, changed, promiseTimeout, raceTimeout } from "../src/index.js";

vi.useFakeTimers();

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
    expect(done).toBe(undefined);

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
      await Promise.resolve();
      expect(value).toBe(undefined);

      setCount(1);
      await Promise.resolve();
      expect(value).toBe(undefined);

      setCount(2);
      await Promise.resolve();
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
