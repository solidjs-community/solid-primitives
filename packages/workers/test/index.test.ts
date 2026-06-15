import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.setConfig({ testTimeout: 2000 });
import { createEffect, createRoot, createSignal, flush } from "solid-js";
import { createReactiveWorker, createWorker, createWorkerPool, createWorkerQuery } from "../src/index.js";
import { workerScope } from "../src/worker-scope.js";
import { makeChannel } from "./setup.js";

// Stub browser globals required by createWorker's blob-URL approach
beforeEach(() => {
  vi.stubGlobal("Blob", class MockBlob {
    constructor(public parts: unknown[], public options?: BlobPropertyBag) {}
  });
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock-url"),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => vi.unstubAllGlobals());

// Run multiple flush + microtask cycles to let the reactive bridge settle.
async function settle(cycles = 5) {
  for (let i = 0; i < cycles; i++) {
    flush();
    await Promise.resolve();
  }
}

// ─── createWorker ────────────────────────────────────────────────────────────

describe("createWorker", () => {
  let mockWorker: { addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn>; terminate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn(),
    };
    vi.stubGlobal("Worker", vi.fn(() => mockWorker));
  });

  it("returns a [worker, start, stop, exports] tuple", () => {
    let result!: ReturnType<typeof createWorker<{ add: (a: number, b: number) => number }>>;
    createRoot(dispose => {
      result = createWorker({ add(a: number, b: number) { return a + b; } });
      dispose();
    });
    expect(result[0]).toBeDefined();
    expect(typeof result[1]).toBe("function");
    expect(typeof result[2]).toBe("function");
    expect(result[3]).toBeInstanceOf(Set);
  });

  it("exports Set contains all passed function names", () => {
    let exports!: Set<string>;
    createRoot(dispose => {
      [, , , exports] = createWorker({
        multiply(a: number, b: number) { return a * b; },
        divide(a: number, b: number) { return a / b; },
      });
      dispose();
    });
    expect(exports.has("multiply")).toBe(true);
    expect(exports.has("divide")).toBe(true);
  });

  it("attaches a typed callable method for each exported function", () => {
    let worker!: ReturnType<typeof createWorker<{ greet: (name: string) => string }>>[0];
    createRoot(dispose => {
      [worker] = createWorker({ greet(name: string) { return `hi ${name}`; } });
      dispose();
    });
    // Typed — no cast required
    expect(typeof worker.greet).toBe("function");
  });

  it("terminates the Worker on owner cleanup", () => {
    const dispose = createRoot(d => {
      createWorker({ noop() {} });
      return d;
    });
    dispose();
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });

  it("terminate is idempotent — double-call does not throw or re-terminate", () => {
    let stop!: () => void;
    const dispose = createRoot(d => {
      [, , stop] = createWorker({ noop() {} });
      return d;
    });
    stop();
    // onCleanup fires a second time — should be a no-op
    expect(() => dispose()).not.toThrow();
    expect(mockWorker.terminate).toHaveBeenCalledTimes(1);
  });

  it("start() replaces the old listener rather than stacking", () => {
    let start!: () => void;
    createRoot(dispose => {
      [, start] = createWorker({ noop() {} });
      start(); // second call
      start(); // third call
      dispose();
    });
    // addEventListener should have been called 3 times (initial + 2 manual),
    // but removeEventListener must have been called 2 times to de-register
    // the previous handler before each re-attach.
    expect(mockWorker.addEventListener).toHaveBeenCalledTimes(3);
    expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(2);
  });
});

// ─── createWorkerPool ────────────────────────────────────────────────────────

describe("createWorkerPool", () => {
  beforeEach(() => {
    vi.stubGlobal("Worker", vi.fn(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn(),
    })));
  });

  it("returns a [proxy, start, stop] tuple", () => {
    let result!: ReturnType<typeof createWorkerPool<{ add: (a: number, b: number) => number }>>;
    createRoot(dispose => {
      result = createWorkerPool(2, { add(a: number, b: number) { return a + b; } });
      dispose();
    });
    expect(result[0]).toBeDefined();
    expect(typeof result[1]).toBe("function");
    expect(typeof result[2]).toBe("function");
  });

  it("spawns exactly concurrency workers", () => {
    const mockFn = () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn(), postMessage: vi.fn(), terminate: vi.fn() });
    const MockW = vi.fn(mockFn);
    vi.stubGlobal("Worker", MockW);

    createRoot(dispose => {
      createWorkerPool(4, { fn() {} });
      dispose();
    });

    expect(MockW).toHaveBeenCalledTimes(4);
  });

  it("start() is idempotent — does not spawn additional workers when pool is running", () => {
    const mockFn = () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn(), postMessage: vi.fn(), terminate: vi.fn() });
    const MockW = vi.fn(mockFn);
    vi.stubGlobal("Worker", MockW);

    createRoot(dispose => {
      const [, start] = createWorkerPool(3, { fn() {} });
      start(); // second call — should be a no-op
      start(); // third call — should be a no-op
      dispose();
    });

    expect(MockW).toHaveBeenCalledTimes(3);
  });

  it("stop() clears the worker pool so start() can respawn", () => {
    const mockFn = () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn(), postMessage: vi.fn(), terminate: vi.fn() });
    const MockW = vi.fn(mockFn);
    vi.stubGlobal("Worker", MockW);

    createRoot(dispose => {
      const [, start, stop] = createWorkerPool(2, { fn() {} });
      stop();
      start(); // should spawn 2 new workers
      dispose();
    });

    expect(MockW).toHaveBeenCalledTimes(4); // 2 initial + 2 after restart
  });
});

// ─── createWorkerQuery ───────────────────────────────────────────────────────

describe("createWorkerQuery", () => {
  it("resolves the initial value", async () => {
    let result!: ReturnType<typeof createWorkerQuery<number>>;
    createRoot(() => {
      result = createWorkerQuery(() => Promise.resolve(42));
    });
    await settle();
    expect(result()).toBe(42);
  });

  it("re-runs when a reactive input changes", async () => {
    const [x, setX] = createSignal(2);
    let result!: ReturnType<typeof createWorkerQuery<number>>;
    createRoot(() => {
      result = createWorkerQuery(() => Promise.resolve(x() * 10));
    });

    await settle();
    expect(result()).toBe(20);

    setX(5);
    await settle();
    expect(result()).toBe(50);
  });

  it("reflects only the latest value when inputs change rapidly", async () => {
    const [n, setN] = createSignal(1);
    let result!: ReturnType<typeof createWorkerQuery<number>>;
    createRoot(() => {
      result = createWorkerQuery(() => Promise.resolve(n()));
    });

    setN(2);
    setN(3);
    setN(4);
    await settle();
    expect(result()).toBe(4);
  });

});

// ─── abort ───────────────────────────────────────────────────────────────────

describe("abort", () => {
  let mockWorker: { addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn>; terminate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockWorker = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn(),
    };
    vi.stubGlobal("Worker", vi.fn(() => mockWorker));
  });

  it("abort() rejects the promise with AbortError before the worker responds", async () => {
    let call!: ReturnType<typeof createWorker<{ noop: () => void }>>[0]["noop"];
    createRoot(dispose => {
      const [worker] = createWorker({ noop() {} });
      call = worker.noop;
      dispose();
    });

    const p = call();
    let error: unknown;
    p.catch(e => { error = e; });

    p.abort();
    await Promise.resolve();

    expect((error as Error).name).toBe("AbortError");
  });

  it("abort() sends a cancel message to the worker", () => {
    let call!: ReturnType<typeof createWorker<{ noop: () => void }>>[0]["noop"];
    createRoot(dispose => {
      const [worker] = createWorker({ noop() {} });
      call = worker.noop;
      dispose();
    });

    const p = call();
    p.catch(() => {});
    p.abort();

    const cancelMsg = mockWorker.postMessage.mock.calls.find(([msg]: [any]) => msg.cancel === true);
    expect(cancelMsg).toBeDefined();
  });

  it("abort() after the promise already resolved is a no-op", async () => {
    let mainListeners: ((e: { data: unknown }) => void)[] = [];
    const mock = {
      addEventListener: vi.fn((_: string, h: (e: { data: unknown }) => void) => { mainListeners.push(h); }),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn(),
    };
    vi.stubGlobal("Worker", vi.fn(() => mock));

    let call!: ReturnType<typeof createWorker<{ add: (a: number, b: number) => number }>>[0]["add"];
    createRoot(dispose => {
      const [worker] = createWorker({ add(a: number, b: number) { return a + b; } });
      call = worker.add;
      dispose();
    });

    const p = call(1, 2);
    const callMsg = mock.postMessage.mock.calls.find(([m]: [any]) => m.method === "add");
    const { id } = callMsg[0];
    mainListeners.forEach(h => h({ data: { type: 1, id, result: 3 } }));

    await Promise.resolve();
    expect(await p).toBe(3);

    expect(() => p.abort()).not.toThrow();
    expect(mock.postMessage.mock.calls.every(([m]: [any]) => !m.cancel)).toBe(true);
  });
});

describe("createWorkerQuery abort", () => {
  it("auto-aborts the previous in-flight call when reactive inputs change", async () => {
    const aborted: string[] = [];
    let callIdx = 0;

    const [n, setN] = createSignal(1);
    createRoot(() => {
      createWorkerQuery(() => {
        n(); // read the signal so the memo tracks it as a dep
        const id = `call-${callIdx++}`;
        const p = new Promise(() => {}) as any; // never resolves — simulates slow worker
        p.abort = () => aborted.push(id);
        return p as Promise<number>;
      });
    });

    await settle();
    setN(2); // triggers re-run; createWorkerQuery should abort call-0 before dispatching call-1
    await settle();

    expect(aborted).toContain("call-0");
  });
});

// ─── createReactiveWorker + workerScope ──────────────────────────────────────

describe("createReactiveWorker + workerScope", () => {
  let channel: ReturnType<typeof makeChannel>;
  let dispose: () => void;

  beforeEach(() => {
    channel = makeChannel();
    vi.stubGlobal("Worker", vi.fn(() => channel.workerObj));
    vi.stubGlobal("self", channel.selfObj);
  });

  afterEach(() => dispose?.());

  it("worker receives initial input values via the init message", async () => {
    let capturedCount: number | undefined;

    createRoot(d => {
      dispose = d;
      createReactiveWorker("blob:fake-worker", {
        inputs: { count: 7 },
        outputs: { doubled: 0 },
      });
    });

    await workerScope<{ count: number }, { doubled: number }>(({ inputs }) => {
      capturedCount = inputs.count;
    });

    expect(capturedCount).toBe(7);
  });

  it("input changes on main thread propagate to the worker store", async () => {
    let workerCount: number | undefined;
    let setInputs!: ReturnType<typeof createReactiveWorker<{ count: number }, { doubled: number }>>["setInputs"];

    createRoot(d => {
      dispose = d;
      ({ setInputs } = createReactiveWorker(
        "blob:fake-worker",
        { inputs: { count: 0 }, outputs: { doubled: 0 } },
      ));

      workerScope<{ count: number }, { doubled: number }>(({ inputs }) => {
        createEffect(
          () => inputs.count,
          v => { workerCount = v; },
        );
      });
    });

    // Writes must happen outside the reactive createRoot scope
    setInputs(s => { (s as any).count = 99; });
    await settle();
    expect(workerCount).toBe(99);
  });

  it("output writes in the worker propagate back to the main thread store", async () => {
    let mainOutputs!: Readonly<{ doubled: number }>;
    let setInputs!: ReturnType<typeof createReactiveWorker<{ count: number }, { doubled: number }>>["setInputs"];

    createRoot(d => {
      dispose = d;
      ({ setInputs, outputs: mainOutputs } = createReactiveWorker(
        "blob:fake-worker",
        { inputs: { count: 0 }, outputs: { doubled: 0 } },
      ));

      workerScope<{ count: number }, { doubled: number }>(({ inputs: wIn, setOutputs }) => {
        createEffect(
          () => wIn.count,
          count => { setOutputs(s => { (s as any).doubled = count * 2; }); },
        );
      });
    });

    setInputs(s => { (s as any).count = 5; });
    await settle();
    expect(mainOutputs.doubled).toBe(10);
  });

  it("multiple input keys update independently", async () => {
    const pairs: Array<[number, number]> = [];
    let setInputs!: ReturnType<typeof createReactiveWorker<{ a: number; b: number }, Record<string, never>>>["setInputs"];

    createRoot(d => {
      dispose = d;
      ({ setInputs } = createReactiveWorker(
        "blob:fake-worker",
        { inputs: { a: 1, b: 2 }, outputs: {} },
      ));

      workerScope<{ a: number; b: number }, Record<string, never>>(({ inputs }) => {
        createEffect(
          () => [inputs.a, inputs.b] as const,
          ([a, b]) => { pairs.push([a, b]); },
        );
      });
    });

    setInputs(s => { (s as any).a = 10; });
    await settle();
    expect(pairs.at(-1)).toEqual([10, 2]);
  });

  it("exposes an error signal that reflects worker ErrorEvents", async () => {
    let errorAccessor!: ReturnType<typeof createReactiveWorker<Record<string, never>, Record<string, never>>>["error"];

    createRoot(d => {
      dispose = d;
      ({ error: errorAccessor } = createReactiveWorker("blob:fake-worker", {
        inputs: {},
        outputs: {},
      }));
    });

    // Simulate a worker error event
    const fakeError = new ErrorEvent("error", { message: "worker crashed" });
    channel.workerObj.dispatchError(fakeError);
    flush();
    await Promise.resolve();

    expect(errorAccessor()).toBe(fakeError);
  });

  it("terminates the Worker when the owner disposes", () => {
    createRoot(d => {
      dispose = d;
      createReactiveWorker("blob:fake-worker", {
        inputs: {},
        outputs: {},
      });
    });

    dispose();
    expect(channel.workerObj.terminate).toHaveBeenCalled();
  });
});
