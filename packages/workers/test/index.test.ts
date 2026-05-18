import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  let mockWorker: { addEventListener: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn>; terminate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockWorker = { addEventListener: vi.fn(), postMessage: vi.fn(), terminate: vi.fn() };
    vi.stubGlobal("Worker", vi.fn(() => mockWorker));
  });

  it("returns a [worker, start, stop, exports] tuple", () => {
    let result!: ReturnType<typeof createWorker>;
    createRoot(dispose => {
      result = createWorker(function add(a: number, b: number) { return a + b; });
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
      [, , , exports] = createWorker(
        function multiply(a: number, b: number) { return a * b; },
        function divide(a: number, b: number) { return a / b; },
      );
      dispose();
    });
    expect(exports.has("multiply")).toBe(true);
    expect(exports.has("divide")).toBe(true);
  });

  it("attaches a callable proxy method for each exported function", () => {
    let worker!: Worker;
    createRoot(dispose => {
      [worker] = createWorker(function greet(name: string) { return `hi ${name}`; });
      dispose();
    });
    expect(typeof (worker as any).greet).toBe("function");
  });

  it("terminates the Worker on owner cleanup", () => {
    const dispose = createRoot(d => {
      createWorker(function noop() {});
      return d;
    });
    dispose();
    expect(mockWorker.terminate).toHaveBeenCalled();
  });
});

// ─── createWorkerPool ────────────────────────────────────────────────────────

describe("createWorkerPool", () => {
  beforeEach(() => {
    vi.stubGlobal("Worker", vi.fn(() => ({
      addEventListener: vi.fn(),
      postMessage: vi.fn(),
      terminate: vi.fn(),
    })));
  });

  it("returns a [proxy, start, stop] tuple", () => {
    let result!: ReturnType<typeof createWorkerPool>;
    createRoot(dispose => {
      result = createWorkerPool(2, function add(a: number, b: number) { return a + b; });
      dispose();
    });
    expect(result[0]).toBeDefined();
    expect(typeof result[1]).toBe("function");
    expect(typeof result[2]).toBe("function");
  });

  it("spawns exactly concurrency workers", () => {
    const MockW = vi.fn(() => ({ addEventListener: vi.fn(), postMessage: vi.fn(), terminate: vi.fn() }));
    vi.stubGlobal("Worker", MockW);

    createRoot(dispose => {
      createWorkerPool(4, function fn() {});
      dispose();
    });

    expect(MockW).toHaveBeenCalledTimes(4);
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
    let mainOutputs!: { doubled: number };
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
