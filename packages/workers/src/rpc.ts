import { onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export type Promisify<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => infer Ret
    ? (...args: Args) => Promise<Awaited<Ret>>
    : T[K] extends (...args: infer Args) => Promise<infer Ret>
    ? (...args: Args) => Promise<Ret>
    : Promise<T[K]>;
};

export interface WorkerRPCOptions {
  /**
   * Timeout in milliseconds before an RPC call rejects with a timeout error.
   * @default 30000 (30 seconds)
   */
  timeout?: number;
  /**
   * Worker instantiation options if passed a URL or script string.
   */
  workerOptions?: WorkerOptions;
}

/**
 * Creates a type-safe RPC proxy communicating with an external Web Worker.
 * Compatible with modern bundlers (Vite, Webpack, SolidStart) using `new URL('./worker.ts', import.meta.url)`.
 * Automatically routes messages with correlation IDs, handles transferables, and terminates worker on owner cleanup.
 *
 * @param workerInput Worker instance, URL, or module path.
 * @param options RPC configuration options.
 * @returns Type-safe Proxy invoking methods on the worker.
 *
 * @example
 * ```ts
 * interface MathWorkerAPI {
 *   add(a: number, b: number): number;
 *   computeFFT(data: Float32Array): Float32Array;
 * }
 *
 * const mathWorker = createWorkerRPC<MathWorkerAPI>(
 *   new URL('./math.worker.ts', import.meta.url)
 * );
 *
 * const sum = await mathWorker.add(10, 20);
 * ```
 */
export function createWorkerRPC<T extends Record<string, any>>(
  workerInput: Worker | URL | string,
  options: WorkerRPCOptions = {},
): Promisify<T> & { terminate: () => void; rawWorker: Worker | null } {
  if (isServer || typeof window === "undefined") {
    const noopProxy = new Proxy({} as any, {
      get: () => async () => {},
    });
    noopProxy.terminate = () => {};
    noopProxy.rawWorker = null;
    return noopProxy;
  }

  const timeoutMs = options.timeout ?? 30000;
  const worker =
    workerInput instanceof Worker
      ? workerInput
      : new Worker(workerInput, options.workerOptions ?? { type: "module" });

  const pending = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void; timer: ReturnType<typeof setTimeout> }>();
  let reqId = 0;

  const onMessage = (e: MessageEvent) => {
    const { id, result, error } = e.data ?? {};
    if (!id || !pending.has(id)) return;

    const { resolve, reject, timer } = pending.get(id)!;
    clearTimeout(timer);
    pending.delete(id);

    if (error) {
      reject(new Error(error));
    } else {
      resolve(result);
    }
  };

  const onError = (e: ErrorEvent) => {
    for (const [id, { reject, timer }] of pending.entries()) {
      clearTimeout(timer);
      reject(new Error(e.message || "Web Worker error"));
    }
    pending.clear();
  };

  worker.addEventListener("message", onMessage);
  worker.addEventListener("error", onError);

  const terminate = () => {
    worker.removeEventListener("message", onMessage);
    worker.removeEventListener("error", onError);
    for (const [, { reject, timer }] of pending.entries()) {
      clearTimeout(timer);
      reject(new Error("Worker terminated"));
    }
    pending.clear();
    worker.terminate();
  };

  onCleanup(terminate);

  const proxy = new Proxy({} as any, {
    get: (_, prop: string) => {
      if (prop === "terminate") return terminate;
      if (prop === "rawWorker") return worker;

      return (...args: any[]) => {
        return new Promise((resolve, reject) => {
          const id = `rpc_${++reqId}_${Math.random().toString(36).slice(2, 6)}`;
          const timer = setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              reject(new Error(`Worker RPC timeout on method '${prop}' after ${timeoutMs}ms`));
            }
          }, timeoutMs);

          pending.set(id, { resolve, reject, timer });

          const transferables: Transferable[] = [];
          for (const arg of args) {
            if (arg instanceof ArrayBuffer) {
              transferables.push(arg);
            } else if (ArrayBuffer.isView(arg) && arg.buffer instanceof ArrayBuffer) {
              transferables.push(arg.buffer);
            }
          }

          worker.postMessage({ id, method: prop, args }, transferables);
        });
      };
    },
  });

  return proxy;
}
