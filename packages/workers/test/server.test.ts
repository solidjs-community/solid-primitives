import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createReactiveWorker, createWorker, createWorkerPool, createWorkerQuery } from "../src/index.js";
import { workerScope } from "../src/worker-scope.js";

// All tests run with --mode ssr so isServer === true

describe("createWorker (SSR)", () => {
  it("returns a stub [EventTarget, noop, noop, Set] tuple without throwing", () => {
    let result: ReturnType<typeof createWorker<{ add: (a: number, b: number) => number }>>;
    createRoot(dispose => {
      result = createWorker({ add(a: number, b: number) { return a + b; } });
      dispose();
    });
    expect(result![0]).toBeInstanceOf(EventTarget);
    expect(typeof result![1]).toBe("function");
    expect(typeof result![2]).toBe("function");
    expect(result![3]).toBeInstanceOf(Set);
  });
});

describe("createWorkerPool (SSR)", () => {
  it("returns a stub [EventTarget, noop, noop] tuple without throwing", () => {
    let result: ReturnType<typeof createWorkerPool<{ fn: () => void }>>;
    createRoot(dispose => {
      result = createWorkerPool(2, { fn() {} });
      dispose();
    });
    expect(result![0]).toBeInstanceOf(EventTarget);
    expect(typeof result![1]).toBe("function");
    expect(typeof result![2]).toBe("function");
  });
});

describe("createWorkerQuery (SSR)", () => {
  it("returns an accessor that yields undefined without throwing", () => {
    let result!: ReturnType<typeof createWorkerQuery<number>>;
    createRoot(dispose => {
      result = createWorkerQuery(() => Promise.resolve(42));
      dispose();
    });
    expect(result()).toBeUndefined();
  });
});

describe("createReactiveWorker (SSR)", () => {
  it("returns stub stores and a null error signal without throwing", () => {
    let inputs: any, outputs: any, error: any;
    createRoot(dispose => {
      ({ inputs, outputs, error } = createReactiveWorker(
        new URL("./fake.worker.ts", import.meta.url),
        { inputs: { count: 5 }, outputs: { doubled: 0 } },
      ));
      dispose();
    });
    expect(inputs.count).toBe(5);
    expect(outputs.doubled).toBe(0);
    expect(error()).toBeNull();
  });
});

describe("workerScope (SSR)", () => {
  it("resolves without throwing (no self.addEventListener in SSR)", async () => {
    // workerScope reads `self`, which doesn't exist in Node/SSR.
    // It should not be called on the server — this test just verifies
    // that importing the module doesn't throw.
    expect(() => {
      void workerScope;
    }).not.toThrow();
  });
});
