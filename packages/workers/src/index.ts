import { Accessor, Setter, createEffect, on, onCleanup } from "solid-js";

import { cjs, setup, KILL, RPC } from "./utils";

/**
 * Creates a very basic WebWorker based on provided code.
 *
 * @param Functions A set of functions to expose via the worker.
 * @param options Web worker options to control the instance.
 * @returns An array with worker, start and stop methods
 */
export function createWorker(...args: (Function | object)[]): WorkerExports {
  if (process.env.SSR) {
    return [new EventTarget() as unknown as Worker, () => {}, () => {}, new Set()];
  }
  const exports = new Set<string>();
  let code = "";
  let options = {};
  for (let i in arguments) {
    if (typeof arguments[i] === "object") {
      options = args[i];
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
  const send = (message: WorkerMessage, options: PostMessageOptions = {}) =>
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
  return [worker, start, stop, exports];
}

/**
 * Creates a worker pool that round-robins work between worker sets.
 *
 * @param number Amount of workers to establish in the pool.
 * @param Functions A set of functions to expose via the worker.
 * @param options Web worker options to control the instance.
 * @returns An array with worker, start and stop methods
 */
export const createWorkerPool = (
  concurrency: number = 1,
  ...args: (Function | object)[]
): WorkerExports => {
  if (process.env.SSR) {
    return [new EventTarget() as unknown as Worker, () => {}, () => {}];
  }
  let current = -1;
  let workers: WorkerExports[] = [];
  const start = () => {
    for (let i = 0; i < concurrency; i += 1) {
      workers.push(createWorker(...args));
    }
  };
  const stop = () => workers.forEach(worker => worker[2]());
  start();
  return [
    // @ts-ignore
    new Proxy(
      {},
      {
        get: function (_, method) {
          current = current + 1 >= workers.length ? 0 : current + 1;
          return function () {
            // @ts-ignore
            return workers[current][0][method].apply(this, arguments);
          };
        }
      }
    ),
    start,
    stop
  ];
};

export type WorkerInstruction = {
  func: Function;
  input?: Accessor<any>;
  output?: Setter<any>;
  concurrency?: number;
};

/**
 * Creates a complex worker that reads inputs and provides outputs.
 *
 * @param args An instruction list of controls for the worker.
 * @returns Basic start and stop functions
 */
export const createSignaledWorker = (
  ...args: WorkerInstruction[]
): [start: () => void, stop: () => void] => {
  if (process.env.SSR) {
    return [
      () => {
        /*noop*/
      },
      () => {
        /*noop*/
      }
    ];
  }
  let fns = [];
  for (const i in args) {
    const { input, output, func } = args[i];
    if (input) {
      createEffect(
        on(input, async () => {
          // @ts-ignore
          const result = await worker[func.name](input());
          if (output) output(result);
        })
      );
    }
    fns.push(func);
  }
  const [worker, start, stop] = createWorker(...fns);
  return [start, stop];
};
