import { Truthy } from "@solid-primitives/utils";
import { createSubRoot } from "@solid-primitives/rootless";
import { Accessor, createComputed, createMemo, onCleanup } from "solid-js";

// .dispose() method is for disposing of root form outside
// raceTimeout calls it when the first promise resolves
export type Until<T> = Promise<Truthy<T>> & { dispose: VoidFunction };

/**
 * Promised one-time watch for changes. Await a reactive condition.
 *
 * @param condition a signal or a reactive condition, which will resolve the promise if truthy
 * @returns A promise that resolves a truthy value of a condition. Or rejects when it's root get's disposed.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/until#readme
 *
 * @example
 * const [count, setCount] = createSignal(0)
 * await until(() => count() > 5)
 *
 * // or with createResource
 * const [data] = createResource(fetcher)
 * const result = await until(data)
 */
export const until = <T>(condition: Accessor<T>): Until<T> =>
  createSubRoot(dispose => {
    const memo = createMemo(condition);
    const promise = new Promise((resolve, reject) => {
      createComputed(() => {
        if (!memo()) return;
        resolve(memo() as Truthy<T>);
        dispose();
      });
      onCleanup(reject);
    }) as Until<T>;
    promise.dispose = dispose;
    return promise;
  });
