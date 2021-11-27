import { onCleanup } from "solid-js";

import { cjs, setup, KILL, RPC } from "./utils";

/**
 * Creates a very basic WebWorker based on provided code.
 *
 * @param code Code to be used inside the Web Worker.
 * @param options Web worker options to control the instance.
 * @returns An array with worker, start and stop methods
 */
export function createWebWorker(
  code: Function | string,
  options: WorkerOptions = {}
): [worker: Worker, start: () => void, stop: () => void] {
  const exports = {};
  const exportObj = `__xpo${Math.random().toString().substring(2)}__`;
  if (typeof code === "function") {
    code = `(${Function.prototype.toString.call(code)})(${exportObj})`;
  }
  code = cjs(code, exportObj, exports);
  code += `\n(${Function.prototype.toString.call(setup)})(self,${exportObj},{})`;
  const url = URL.createObjectURL(
    new Blob([code], { type: "text/javascript" })
  );
  const worker = new Worker(url, options);
  let callbacks: WorkerCallbacks = new Map();
  let counter = 0;
  const terminate = () => {
    URL.revokeObjectURL(url);
    worker.terminate.call(worker);
  };
  const send = (message: WorkerMessage, options?: PostMessageOptions) =>
    worker.postMessage(message, options);
  const stop = () => {
    send({ type: KILL, signal: 0 });
    terminate();
  };
  const call = (method: string, params: any) =>
    new Promise((resolve, reject) => {
      let id = `rpc${counter++}`;
      callbacks.set(id, [resolve, reject]);
      send({ type: RPC, id, method, params });
    });
  const start = () => setup(worker, {}, callbacks);
  const expose = (methodName: string) => {
    // @ts-ignore
    worker[methodName] = function() {
      return call(methodName, [].slice.call(arguments));
    };
  };
  for (let i in exports) if (!(i in worker)) expose(i);
  start();
  onCleanup(terminate);
  return [worker, start, stop];
}

export default createWebWorker;
