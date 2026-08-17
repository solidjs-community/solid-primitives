/** Discriminant identifying an RPC message on the `createWorker` message channel. */
export type WorkerSignal = number;

/** Pending RPC calls awaiting a response, keyed by request id. */
export type WorkerCallbacks = Map<
  string,
  [resolve: (value: unknown) => void, reject: (reason: unknown) => void]
>;

/** Wire format exchanged between `createWorker`'s main-thread proxy and the worker's RPC dispatcher. */
export type WorkerMessage = {
  type: WorkerSignal;
  id?: string;
  error?: string;
  method?: string;
  result?: unknown;
  params?: unknown[];
  cancel?: true;
};

/** A Promise with an `abort()` method that rejects it immediately and notifies the worker. */
export type CancellablePromise<T> = Promise<T> & { abort: () => void };

/** Maps each function in T to its async RPC counterpart on the main thread. */
export type WorkerMethods<T extends Record<string, Function>> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => CancellablePromise<Awaited<R>>
    : never;
};

/** Return value of `createWorker`: the RPC proxy, controls to restart/terminate it, and the set of exported method names. */
export type CreateWorkerResult<T extends Record<string, Function>> = [
  worker: Worker & WorkerMethods<T>,
  start: () => void,
  stop: () => void,
  exports: Set<string & keyof T>,
];

/** Return value of `createWorkerPool`: the round-robin RPC proxy and controls to restart/terminate the pool. */
export type CreateWorkerPoolResult<T extends Record<string, Function>> = [
  proxy: Worker & WorkerMethods<T>,
  start: () => void,
  stop: () => void,
];

/** Wire format exchanged between `createReactiveWorker` (main thread) and `workerScope` (worker). */
export type BridgeMessage =
  | { type: "init"; inputs: Record<string, unknown>; outputs: Record<string, unknown> }
  | { type: "input"; key: string; value: unknown }
  | { type: "outputs"; snapshot: Record<string, unknown> };
