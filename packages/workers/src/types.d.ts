export type WorkerSignal = number;

export type WorkerCallbacks = Map<
  string,
  [resolve: (value: unknown) => void, reject: (reason: unknown) => void]
>;

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

export type CreateWorkerResult<T extends Record<string, Function>> = [
  worker: Worker & WorkerMethods<T>,
  start: () => void,
  stop: () => void,
  exports: Set<string & keyof T>,
];

export type CreateWorkerPoolResult<T extends Record<string, Function>> = [
  proxy: Worker & WorkerMethods<T>,
  start: () => void,
  stop: () => void,
];

export type BridgeMessage =
  | { type: "init"; inputs: Record<string, unknown>; outputs: Record<string, unknown> }
  | { type: "input"; key: string; value: unknown }
  | { type: "outputs"; snapshot: Record<string, unknown> };
