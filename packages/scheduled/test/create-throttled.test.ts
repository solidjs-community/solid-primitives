import {
  type Accessor,
  createRenderEffect,
  createRoot,
  createSignal,
  flush,
  isPending,
} from "solid-js";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { createThrottled } from "../src/index.js";

beforeAll(() => {
  vi.useFakeTimers();
});

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

const tick = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
  flush();
};

const advance = async (ms: number) => {
  await vi.advanceTimersByTimeAsync(ms);
  await tick();
};

function setup<T>(create: (source: Accessor<T>) => Accessor<T>, initial: Exclude<T, Function>) {
  const [source, setSource] = createSignal<T>(initial);
  let value!: Accessor<T>;
  const dispose = createRoot(dispose => {
    value = create(source);
    return dispose;
  });
  flush();
  return { setSource, value, dispose };
}

describe("createThrottled", () => {
  test("returns the initial value synchronously and throttles changes", async () => {
    const { setSource, value, dispose } = setup(src => createThrottled(src, 50), "a");

    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);

    setSource("b");
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("coalesces changes without resetting the window", async () => {
    const { setSource, value, dispose } = setup(src => createThrottled(src, 50), "a");

    setSource("b");
    flush();
    await advance(30);
    setSource("c");
    flush();
    await advance(19);

    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(1);
    expect(value()).toBe("c");
    expect(isPending(value)).toBe(false);

    await advance(50);
    setSource("d");
    flush();
    expect(value()).toBe("c");
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe("d");

    dispose();
  });

  test("cancels a pending change that returns to the current value but keeps the window", async () => {
    const { setSource, value, dispose } = setup(src => createThrottled(src, 50), "a");

    setSource("b");
    flush();
    expect(isPending(value)).toBe(true);

    await advance(25);
    setSource("a");
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);

    await advance(1);
    setSource("c");
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(24);
    expect(value()).toBe("c");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("isPending is reactive", async () => {
    const [source, setSource] = createSignal(0);
    const pending: boolean[] = [];

    const dispose = createRoot(dispose => {
      const value = createThrottled(source, 50);
      createRenderEffect(
        () => isPending(value),
        isPendingValue => void pending.push(isPendingValue),
      );
      return dispose;
    });

    flush();
    expect(pending).toEqual([false]);

    setSource(1);
    flush();
    expect(pending.at(-1)).toBe(true);

    await advance(50);
    expect(pending.at(-1)).toBe(false);

    dispose();
  });

  test("supports leading + trailing", async () => {
    const { setSource, value, dispose } = setup(
      src => createThrottled(src, 50, { leading: true }),
      "a",
    );

    setSource("b");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    await advance(10);
    setSource("c");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(true);

    await advance(40);
    expect(value()).toBe("c");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("leading + trailing does not repeat a lone leading emission", async () => {
    const { setSource, value, dispose } = setup(
      src => createThrottled(src, 50, { leading: true }),
      "a",
    );

    setSource("b");
    flush();
    expect(value()).toBe("b");

    await advance(50);
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("supports leading only", async () => {
    const { setSource, value, dispose } = setup(
      src => createThrottled(src, 50, { leading: true, trailing: false }),
      "a",
    );

    setSource("b");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    await advance(10);
    setSource("c");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    await advance(50);
    setSource("d");
    flush();
    expect(value()).toBe("d");

    dispose();
  });

  test("cancels the pending timer on dispose", async () => {
    const { setSource, value, dispose } = setup(src => createThrottled(src, 50), "a");

    setSource("b");
    flush();
    expect(isPending(value)).toBe(true);

    dispose();
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    await advance(50);
    expect(value()).toBe("a");
  });
});

/* eslint-disable */
function typeChecks() {
  const source = () => "";

  createThrottled(source, 100);
  createThrottled(source, 100, {});
  createThrottled(source, 100, { leading: true });
  createThrottled(source, 100, { leading: true, trailing: false });
  // @ts-expect-error -- leading and trailing cannot both be false
  createThrottled(source, 100, { leading: false, trailing: false });
  // @ts-expect-error -- trailing: false requires leading: true
  createThrottled(source, 100, { trailing: false });
  // @ts-expect-error -- maxWait is debounce-only
  createThrottled(source, 100, { maxWait: 200 });
}
/* eslint-enable */
