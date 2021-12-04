import type { WorkerInstruction } from './index';

export const createWorker = (..._args: (Function | object)[]): WorkerExports => {
  return [
      // @ts-ignore
      () => new Proxy({}, {}),
      () => {
        /*noop*/
      },
      () => {
        /*noop*/
      },
      undefined
    ];
}

export const createWorkerPool = (
  _concurrency: number = 1,
  ..._args: (Function | object)[]
): WorkerExports => {
  return [
    // @ts-ignore
    new Proxy(
      {},
      {
        get: function (_, method) {
          /*noop*/
        }
      }
    ),
    () => {
      /*noop*/
    },
    () => {
      /*noop*/
    }
  ];
};

export const createSignaledWorker = (
  ..._args: WorkerInstruction[]
): [start: () => void, stop: () => void] => {
  return [
    () => {
      /*noop*/
    },
    () => {
      /*noop*/
    }
  ];
};
