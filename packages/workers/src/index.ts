import { onCleanup } from "solid-js";

import { cjs, setup, KILL, RPC } from "./utils";

/**
 * Creates a very basic WebWorker based on provided code.
 *
 * @param code Code to be used inside the Web Worker.
 * @param options Web worker options to control the instance.
 * @returns An array with worker, start and stop methods
 */
function createWebWorker(
  ...args: (Function | object)[]
): [worker: Worker, start: () => void, stop: () => void] {
  const exports = new Set<string>();
  let code = "";
  let options = {};
  for (let i in arguments) {
    if (typeof arguments[i] === "object") {
      options = arguments[i];
      continue;
    }
    const exportObj = `__xpo${Math.random().toString().substring(2)}__`;
    code += cjs(`export ${arguments[i]}`, exportObj, exports);
    code += `\n(${Function.prototype.toString.call(setup)})(self,${exportObj},{})\n`;
  }
  const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
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
    worker[methodName] = function () {
      return call(methodName, [].slice.call(arguments));
    };
  };
  for (var it = exports.values(), val = null; (val = it.next().value); ) {
    if (!(val in worker)) expose(val);
  }
  start();
  onCleanup(terminate);
  return [worker, start, stop];
}

export default createWebWorker;
