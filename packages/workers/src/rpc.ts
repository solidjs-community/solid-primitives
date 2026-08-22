import { onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export type WorkerFunction = (...args: readonly never[]) => Promise<never> | never;

export type PromisifyWorker<T extends Record<string, WorkerFunction>> = {
  [K in keyof T]: (
    ...args: Parameters<T[K]>
  ) => Promise<Awaited<ReturnType<T[K]>>>;
};

export interface WorkerRPCOptions {
  timeout?: number;
  workerOptions?: WorkerOptions;
}

interface RPCRequestPayload {
  id: string;
  method: string;
  args: readonly ArrayBufferView[] | readonly string[] | readonly number[] | readonly boolean[];
}

interface RPCResponsePayload<R> {
  id: string;
  result?: R;
  error?: string;
}

interface PendingCall<R> {
  resolve: (value: R) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export function createWorkerRPC<T extends Record<string, WorkerFunction>>(
  workerInput: Worker | URL | string,
  options: WorkerRPCOptions = {},
): PromisifyWorker<T> & { terminate: () => void; rawWorker: Worker | null } {
  if (isServer || typeof window === "undefined") {
    const noopHandler = () => Promise.resolve(undefined as never);
    return new Proxy({} as PromisifyWorker<T> & { terminate: () => void; rawWorker: Worker | null }, {
      get: (_, prop: string) => {
        if (prop === "terminate") return () => {};
        if (prop === "rawWorker") return null;
        return noopHandler;
      },
    });
  }

  const timeoutMs = options.timeout ?? 30000;
  const worker =
    workerInput instanceof Worker
      ? workerInput
      : new Worker(workerInput, options.workerOptions ?? { type: "module" });

  const pending = new Map<string, PendingCall<never>>();
  let reqId = 0;

  const onMessage = (e: MessageEvent<RPCResponsePayload<never>>) => {
    const { id, result, error } = e.data ?? {};
    if (!id || !pending.has(id)) return;

    const entry = pending.get(id);
    if (!entry) return;

    clearTimeout(entry.timer);
    pending.delete(id);

    if (error) {
      entry.reject(new Error(error));
    } else {
      entry.resolve(result as never);
    }
  };

  const onError = (e: ErrorEvent) => {
    for (const [, entry] of pending.entries()) {
      clearTimeout(entry.timer);
      entry.reject(new Error(e.message || "Web Worker error"));
    }
    pending.clear();
  };

  worker.addEventListener("message", onMessage);
  worker.addEventListener("error", onError);

  const terminate = () => {
    worker.removeEventListener("message", onMessage);
    worker.removeEventListener("error", onError);
    for (const [, entry] of pending.entries()) {
      clearTimeout(entry.timer);
      entry.reject(new Error("Worker terminated"));
    }
    pending.clear();
    worker.terminate();
  };

  onCleanup(terminate);

  return new Proxy({} as PromisifyWorker<T> & { terminate: () => void; rawWorker: Worker | null }, {
    get: (_, prop: string) => {
      if (prop === "terminate") return terminate;
      if (prop === "rawWorker") return worker;

      return (...args: readonly ArrayBufferView[] | readonly string[] | readonly number[] | readonly boolean[]) => {
        return new Promise<never>((resolve, reject) => {
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

          const payload: RPCRequestPayload = { id, method: prop, args };
          worker.postMessage(payload, transferables);
        });
      };
    },
  });
}
