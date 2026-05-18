import { createEffect, createRoot, createStore, deep, type StoreSetter } from "solid-js";
import type { BridgeMessage } from "./types.js";

// Minimal interface covering DedicatedWorkerGlobalScope without requiring webworker lib
type WorkerCtx = {
  postMessage(data: unknown): void;
  addEventListener(type: "message", handler: (e: MessageEvent) => void): void;
  removeEventListener(type: "message", handler: (e: MessageEvent) => void): void;
};

export type WorkerScopeResult<
  I extends Record<string, unknown>,
  O extends Record<string, unknown>,
> = {
  /** Reactive store proxy of inputs driven by the main thread. Read directly: `inputs.data`. */
  inputs: I;
  /** Store setter for outputs. Writes are automatically forwarded to the main thread. */
  setOutputs: StoreSetter<O>;
};

/**
 * Companion to `createReactiveWorker`. Call at the top of your worker module to receive
 * a reactive `inputs` store and an `setOutputs` setter that bridges writes back to main.
 *
 * The `setup` callback runs inside a `createRoot` so any `createEffect` or `createMemo`
 * you create there has a proper owner for the lifetime of the worker.
 *
 * @example
 * ```ts
 * // my.worker.ts
 * import { createEffect, createMemo } from 'solid-js';
 * import { workerScope } from '@solid-primitives/workers/worker';
 *
 * workerScope<{ data: number[]; threshold: number }, { result: number }>(
 *   ({ inputs, setOutputs }) => {
 *     const filtered = createMemo(() => inputs.data.filter(v => v > inputs.threshold));
 *     createEffect(() => filtered(), v => setOutputs(s => { s.result = v.length; }));
 *   }
 * );
 * ```
 */
export function workerScope<
  I extends Record<string, unknown> = Record<string, unknown>,
  O extends Record<string, unknown> = Record<string, unknown>,
>(setup?: (scope: WorkerScopeResult<I, O>) => void): Promise<WorkerScopeResult<I, O>> {
  const ctx = self as unknown as WorkerCtx;

  return new Promise<WorkerScopeResult<I, O>>(resolve => {
    const onInit = ({ data }: MessageEvent<BridgeMessage>) => {
      if (data.type !== "init") return;
      ctx.removeEventListener("message", onInit);

      createRoot(() => {
        const [inputs, _setInputs] = createStore<I>(data.inputs as any);
        const [outputs, _setOutputs] = createStore<O>(data.outputs as any);

        // Apply input changes pushed from the main thread
        ctx.addEventListener("message", ({ data: msg }: MessageEvent<BridgeMessage>) => {
          if (msg.type === "input") {
            _setInputs(s => {
              (s as any)[msg.key] = msg.value;
            });
          }
        });

        // Forward output changes back to the main thread.
        // deep(outputs) deeply tracks the entire outputs store and returns a plain snapshot.
        // defer:true skips the initial run — main thread already has the defaults from init.
        createEffect(
          () => deep(outputs),
          (snapshot: Record<string, unknown>) =>
            ctx.postMessage({ type: "outputs", snapshot } satisfies BridgeMessage),
          { defer: true } as any,
        );

        const scope: WorkerScopeResult<I, O> = { inputs, setOutputs: _setOutputs };
        if (setup) setup(scope);
        resolve(scope);
      });
    };

    ctx.addEventListener("message", onInit);
  });
}
