import {
  type Accessor,
  createMemo,
  createRenderEffect,
  createRoot,
  createSignal,
  flush,
  isPending,
} from "solid-js";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { createDebounced } from "../src/index.js";

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

describe("createDebounced", () => {
  test("returns the initial value synchronously and debounces changes", async () => {
    const { setSource, value, dispose } = setup(src => createDebounced(src, 50), "a");

    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);

    setSource("b");
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(49);
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(1);
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("resets the window on every change", async () => {
    const { setSource, value, dispose } = setup(src => createDebounced(src, 50), "a");

    setSource("b");
    flush();
    await advance(30);
    setSource("c");
    flush();
    await advance(30);

    expect(value()).toBe("a");
    expect(isPending(value)).toBe(true);

    await advance(20);
    expect(value()).toBe("c");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("cancels a pending change that returns to the current value", async () => {
    const { setSource, value, dispose } = setup(src => createDebounced(src, 50), "a");

    setSource("b");
    flush();
    expect(isPending(value)).toBe(true);

    setSource("a");
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);

    await advance(50);
    expect(value()).toBe("a");

    dispose();
  });

  test("isPending is reactive", async () => {
    const [source, setSource] = createSignal(0);
    const pending: boolean[] = [];

    const dispose = createRoot(dispose => {
      const value = createDebounced(source, 50);
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
      src => createDebounced(src, 50, { leading: true }),
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

    await advance(10);
    setSource("d");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe("d");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("a lone leading emission does not leave isPending true", async () => {
    const { setSource, value, dispose } = setup(
      src => createDebounced(src, 50, { leading: true }),
      "a",
    );

    setSource("b");
    flush();
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    await advance(50);
    expect(value()).toBe("b");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("supports leading only", async () => {
    const { setSource, value, dispose } = setup(
      src => createDebounced(src, 50, { leading: true, trailing: false }),
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

    await advance(60);
    setSource("d");
    flush();
    expect(value()).toBe("d");

    dispose();
  });

  test("maxWait forces a landing while changes continue", async () => {
    const { setSource, value, dispose } = setup(
      src => createDebounced(src, 100, { maxWait: 150 }),
      0,
    );

    setSource(1);
    flush();
    await advance(50);
    setSource(2);
    flush();
    await advance(50);
    setSource(3);
    flush();

    expect(value()).toBe(0);
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe(3);
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("maxWait works with leading + trailing", async () => {
    const { setSource, value, dispose } = setup(
      src => createDebounced(src, 100, { maxWait: 150, leading: true }),
      0,
    );

    setSource(1);
    flush();
    expect(value()).toBe(1);
    expect(isPending(value)).toBe(false);

    await advance(50);
    setSource(2);
    flush();
    await advance(50);
    setSource(3);
    flush();

    expect(value()).toBe(1);
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe(3);
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("waits for an async source before starting the window", async () => {
    const gates: Array<() => void> = [];
    const [id, setId] = createSignal(1);
    let value!: Accessor<string>;

    const dispose = createRoot(dispose => {
      const source = createMemo(() => {
        const current = id();
        return new Promise<string>(resolve => gates.push(() => resolve(`v${current}`)));
      });
      value = createDebounced(source, 50);
      return dispose;
    });

    flush();
    gates.shift()!();
    await tick();
    expect(value()).toBe("v1");
    expect(isPending(value)).toBe(false);

    setId(2);
    flush();
    await advance(0);
    expect(value()).toBe("v1");
    expect(isPending(value)).toBe(true);

    gates.shift()!();
    await tick();
    expect(value()).toBe("v1");
    expect(isPending(value)).toBe(true);

    await advance(50);
    expect(value()).toBe("v2");
    expect(isPending(value)).toBe(false);

    dispose();
  });

  test("cancels maxWait and trailing timers on dispose", async () => {
    const { setSource, value, dispose } = setup(
      src => createDebounced(src, 100, { maxWait: 150 }),
      "a",
    );

    setSource("b");
    flush();
    expect(isPending(value)).toBe(true);

    dispose();
    flush();
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);

    await advance(200);
    expect(value()).toBe("a");
    expect(isPending(value)).toBe(false);
  });

  test("cancels the pending timer on dispose", async () => {
    const { setSource, value, dispose } = setup(src => createDebounced(src, 50), "a");

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

  createDebounced(source, 100);
  createDebounced(source, 100, {});
  createDebounced(source, 100, { leading: true });
  createDebounced(source, 100, { leading: true, trailing: false });
  createDebounced(source, 100, { maxWait: 200 });
  // @ts-expect-error -- leading and trailing cannot both be false
  createDebounced(source, 100, { leading: false, trailing: false });
  // @ts-expect-error -- trailing: false requires leading: true
  createDebounced(source, 100, { trailing: false });
}
/* eslint-enable */
