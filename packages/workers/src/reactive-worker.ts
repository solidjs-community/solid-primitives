import {
  type Accessor,
  createEffect,
  createSignal,
  createStore,
  deep,
  onCleanup,
  type StoreSetter,
} from "solid-js";
import { isServer } from "@solidjs/web";
import type { BridgeMessage } from "./types.d.ts";

/**
 * Creates a reactive worker bridge backed by Solid stores.
 *
 * - `inputs` is a writable store on the main thread. Any change (including nested
 *   property mutations) is deeply tracked and forwarded to the worker automatically.
 * - `outputs` is a read-only store on the main thread, driven by the worker's writes.
 * - `error` is a signal that holds the last `ErrorEvent` from the worker, or `null`.
 *
 * Must be called inside a component or `createRoot`.
 *
 * > **Large data note:** each input key change sends the full serialized value of
 * > that key. For large arrays or deeply nested objects prefer `Transferable` buffers
 * > or chunked updates to avoid serialization overhead.
 *
 * @param url URL of the worker module (use `new URL('./my.worker.ts', import.meta.url)`)
 * @param schema Initial values for inputs and outputs
 *
 * @example
 * ```ts
 * const { inputs, setInputs, outputs, error } = createReactiveWorker(
 *   new URL('./my.worker.ts', import.meta.url),
 *   { inputs: { data: [] as number[], threshold: 0.5 }, outputs: { result: 0 } }
 * );
 *
 * setInputs(s => { s.threshold = 0.8; });  // draft setter — syncs to worker
 * outputs.result;                           // reactive read, no ()
 * error();                                  // Accessor<ErrorEvent | null>
 * ```
 */
export function createReactiveWorker<
  I extends Record<string, unknown>,
  O extends Record<string, unknown>,
>(
  url: URL | string,
  schema: { inputs: I; outputs: O },
): { inputs: I; setInputs: StoreSetter<I>; outputs: Readonly<O>; error: Accessor<ErrorEvent | null> } {
  const [inputs, setInputs] = createStore<I>(schema.inputs as any);
  const [outputs, _setOutputs] = createStore<O>(schema.outputs as any);
  const [error, _setError] = createSignal<ErrorEvent | null>(null);

  if (!isServer) {
    const worker = new Worker(url, { type: "module" });

    worker.postMessage({
      type: "init",
      inputs: { ...schema.inputs },
      outputs: { ...schema.outputs },
    } satisfies BridgeMessage);

    // Per-key deep tracking: `deep(inputs[key])` subscribes to nested changes and
    // returns a serializable snapshot. defer:true skips the first run since init covers it.
    for (const key of Object.keys(schema.inputs)) {
      createEffect(
        () => deep((inputs as any)[key]),
        (value: unknown) => worker.postMessage({ type: "input", key, value } satisfies BridgeMessage),
        { defer: true } as any,
      );
    }

    const onMessage = ({ data }: MessageEvent<BridgeMessage>) => {
      if (data.type === "outputs") {
        _setOutputs(s => Object.assign(s as any, data.snapshot));
      }
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", ev => _setError(ev as ErrorEvent));

    onCleanup(() => {
      worker.removeEventListener("message", onMessage);
      worker.terminate();
    });
  }

  return { inputs, setInputs, outputs: outputs as Readonly<O>, error };
}
