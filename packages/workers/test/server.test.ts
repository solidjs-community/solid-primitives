import { describe, expect, it } from "vitest";
import { createRoot } from "solid-js";
import { createReactiveWorker, createWorker, createWorkerPool, createWorkerQuery } from "../src/index.js";
import { workerScope } from "../src/worker-scope.js";

// All tests run with --mode ssr so isServer === true

describe("createWorker (SSR)", () => {
  it("returns a stub [EventTarget, noop, noop, undefined] tuple without throwing", () => {
    let result: ReturnType<typeof createWorker>;
    createRoot(dispose => {
      result = createWorker(function add(a: number, b: number) {
        return a + b;
      });
      dispose();
    });
    expect(result![0]).toBeInstanceOf(EventTarget);
    expect(typeof result![1]).toBe("function");
    expect(typeof result![2]).toBe("function");
  });
});

describe("createWorkerPool (SSR)", () => {
  it("returns a stub tuple without throwing", () => {
    let result: ReturnType<typeof createWorkerPool>;
    createRoot(dispose => {
      result = createWorkerPool(2, function fn() {});
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
  it("returns stub stores without throwing", () => {
    let inputs: any, outputs: any;
    createRoot(dispose => {
      ({ inputs, outputs } = createReactiveWorker(
        new URL("./fake.worker.ts", import.meta.url),
        { inputs: { count: 5 }, outputs: { doubled: 0 } },
      ));
      dispose();
    });
    // Stores should reflect the initial schema values on the server
    expect(inputs.count).toBe(5);
    expect(outputs.doubled).toBe(0);
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
