import { createEffect, onMount, createMemo, createSignal, onCleanup } from "solid-js";

type WorkerState = {
  result?: unknown;
  error?: "error" | "messageerror";
};

/**
 * Handles managing a workers input and output.
 *
 * @param path - String to the worker
 * @param options - Optiions to supply the worker
 * @param input - Input to supply thee worker
 * @return Returned statate from the worker
 *
 * @example
 * ```ts
 * const output = createWorker('./worker.js', { hello: 'world' });
 * ```
 */
const createWorker = (
  path: string,
  input: unknown,
  options: WorkerOptions = { type: "module" }
) => {
  const [state, setState] = createSignal<WorkerState>({});
  const worker = createMemo(() => new Worker(path, options));
  onMount(() => {
    let setStateSafe = (nextState: WorkerState) => setState(nextState);
    worker().onmessage = e => setStateSafe({ result: e.data });
    worker().onerror = () => setStateSafe({ error: "error" });
    worker().onmessageerror = () => setStateSafe({ error: "messageerror" });
  });
  onCleanup(() => worker().terminate());
  createEffect(() => worker().postMessage(input));
  return state;
};

export default createWorker;
