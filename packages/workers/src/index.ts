import { type Accessor, createMemo, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import type {
  CancellablePromise,
  WorkerCallbacks,
  WorkerMessage,
  WorkerMethods,
  CreateWorkerResult,
  CreateWorkerPoolResult,
} from "./types.js";
import { RPC, buildWorkerCode, setup } from "./utils.js";

export type * from "./types.js";
export { createReactiveWorker } from "./reactive-worker.js";

/**
 * Spawns a worker from a record of named functions, exposing each as a typed
 * async RPC method on the returned worker object. The worker is automatically
 * terminated when the reactive owner is disposed.
 *
 * **Functions must be self-contained** — no closures over outer variables, no
 * imports. They are serialized via `Function.prototype.toString` and run in a
 * separate thread with no access to the surrounding scope.
 *
 * @param fns An object whose methods will be callable on the returned worker.
 * @param options WorkerOptions passed to the `Worker` constructor.
 * @returns `[worker, start, stop, exports]`
 *
 * @example
 * ```ts
 * const [worker] = createWorker({
 *   add(a: number, b: number) { return a + b; },
 *   multiply(a: number, b: number) { return a * b; },
 * });
 * console.log(await worker.add(1, 2));      // 3
 * console.log(await worker.multiply(3, 4)); // 12
 * ```
 */
export function createWorker<T extends Record<string, Function>>(
  fns: T,
  options: WorkerOptions = {},
): CreateWorkerResult<T> {
  if (isServer) {
    return [
      new EventTarget() as unknown as Worker & WorkerMethods<T>,
      () => {},
      () => {},
      new Set<string & keyof T>(),
    ];
  }

  const exports = new Set<string & keyof T>();
  const code = buildWorkerCode(fns as Record<string, Function>, exports as Set<string>);
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
  const worker = new Worker(url, options);
  const callbacks: WorkerCallbacks = new Map();
  let counter = 0;
  let terminated = false;

  const terminate = () => {
    if (terminated) return;
    terminated = true;
    URL.revokeObjectURL(url);
    worker.terminate();
  };

  let stopListener: (() => void) | null = null;
  const start = () => {
    stopListener?.();
    stopListener = setup(worker, {}, callbacks);
  };

  const stop = () => {
    stopListener?.();
    stopListener = null;
    terminate();
  };

  const call = (method: string, params: unknown[]): CancellablePromise<unknown> => {
    const id = `rpc${counter++}`;
    const promise = new Promise<unknown>((resolve, reject) => {
      callbacks.set(id, [resolve, reject]);
      worker.postMessage({ type: RPC, id, method, params } satisfies WorkerMessage);
    });
    const abort = () => {
      const cb = callbacks.get(id);
      if (!cb) return;
      callbacks.delete(id);
      worker.postMessage({ type: RPC, id, cancel: true } satisfies WorkerMessage);
      cb[1](Object.assign(new Error("Worker call aborted"), { name: "AbortError" }));
    };
    return Object.assign(promise, { abort });
  };

  const proxy = worker as Worker & WorkerMethods<T>;
  for (const name of exports) {
    (proxy as Record<string, unknown>)[name] = (...args: unknown[]) => call(name, args);
  }

  start();
  onCleanup(terminate);

  return [proxy, start, stop, exports];
}

/**
 * Creates a pool of workers that round-robins calls across `concurrency` instances.
 * Each call is dispatched to the next worker in rotation.
 *
 * @param concurrency Number of worker instances to spawn.
 * @param fns An object of self-contained functions (same constraints as `createWorker`).
 * @param options WorkerOptions passed to each `Worker` constructor.
 * @returns `[proxy, start, stop]`
 *
 * @example
 * ```ts
 * const [pool] = createWorkerPool(4, {
 *   add(a: number, b: number) { return a + b; },
 * });
 * const results = await Promise.all([
 *   pool.add(1, 2),
 *   pool.add(3, 4),
 *   pool.add(5, 6),
 * ]);
 * // results: [3, 7, 11] — spread across 4 workers
 * ```
 */
export function createWorkerPool<T extends Record<string, Function>>(
  concurrency: number = 1,
  fns: T,
  options: WorkerOptions = {},
): CreateWorkerPoolResult<T> {
  if (isServer) {
    return [new EventTarget() as unknown as Worker & WorkerMethods<T>, () => {}, () => {}];
  }

  let current = -1;
  let workers: CreateWorkerResult<T>[] = [];

  const start = () => {
    if (workers.length > 0) return;
    current = -1;
    for (let i = 0; i < concurrency; i++) {
      workers.push(createWorker(fns, options));
    }
  };

  const stop = () => {
    workers.forEach(w => w[2]());
    workers = [];
    current = -1;
  };

  start();

  // Capture the round-robin index at get-time, not call-time, so that
  // storing a reference to a method and calling it later dispatches to
  // the correct worker rather than whichever `current` points to then.
  const proxy = new Proxy({} as Worker & WorkerMethods<T>, {
    get(_, method: string) {
      current = current + 1 >= workers.length ? 0 : current + 1;
      const idx = current;
      return (...args: unknown[]) => (workers[idx]![0] as Record<string, Function>)[method]!(...args);
    },
  });

  return [proxy, start, stop];
}

/**
 * A reactive async query backed by a worker call. Re-runs whenever reactive
 * inputs inside `fn` change and integrates with `<Loading>` for suspense-aware
 * rendering. Returns `undefined` until the first resolution.
 *
 * @param fn A function that calls a worker method with reactive inputs.
 * @returns An accessor that holds the latest resolved value, or `undefined` while pending.
 *
 * @example
 * ```ts
 * const [input, setInput] = createSignal<[number, number]>([1, 1]);
 * const result = createWorkerQuery<number>(() => worker.add(...input()));
 *
 * // In JSX:
 * // <Loading fallback={<span>calculating…</span>}>
 * //   <span>{result()}</span>
 * // </Loading>
 * ```
 */
export function createWorkerQuery<T>(fn: () => Promise<T>): Accessor<T | undefined> {
  if (isServer) return () => undefined;
  let abort: (() => void) | undefined;
  return createMemo(async () => {
    abort?.();
    const p = fn();
    abort = typeof (p as any).abort === "function" ? (p as any).abort : undefined;
    return p;
  }) as Accessor<T | undefined>;
}
