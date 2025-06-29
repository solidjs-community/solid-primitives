import {
  type Accessor,
  createComputed,
  createMemo,
  createRoot,
  getOwner,
  onCleanup,
} from "solid-js";
import { asArray, type Truthy } from "@solid-primitives/utils";

/**
 * Creates a promise that resolves *(or rejects)* after given time.
 *
 * @param ms timeout duration in ms
 * @param throwOnTimeout promise will be rejected on timeout if set to `true`
 * @param reason rejection reason
 * @returns Promise<void>
 *
 * @example
 * ```ts
 * await promiseTimeout(1500) // will resolve void after timeout
 * await promiseTimeout(1500, true, 'rejection reason') // will reject 'rejection reason' after timout
 * ```
 */
export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason: any = "Timeout",
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms),
  );

/**
 * Combination of `Promise.race()` and `promiseTimeout`.
 *
 * @param promises single promise, or array of promises
 * @param ms timeout duration in ms
 * @param throwOnTimeout promise will be rejected on timeout if set to `true`
 * @param reason rejection reason
 * @returns a promise resulting in value of the first source promises to be resolved
 *
 * @example
 * ```ts
 * // single promise
 * await raceTimeout(new Promise(() => {...}), 3000)
 * // list of promises racing
 * await raceTimeout([new Promise(),new Promise()...], 3000)
 * // reject on timeout
 * await raceTimeout(new Promise(), 3000, true, 'rejection reason')
 * ```
 */
export function raceTimeout<T>(
  promises: T,
  ms: number,
  throwOnTimeout: true,
  reason?: any,
): T extends any[] ? Promise<Awaited<T[number]>> : Promise<Awaited<T>>;
export function raceTimeout<T>(
  promises: T,
  ms: number,
  throwOnTimeout?: boolean,
  reason?: any,
): T extends any[] ? Promise<Awaited<T[number]> | undefined> : Promise<Awaited<T> | undefined>;
export function raceTimeout(
  input: any,
  ms: number,
  throwOnTimeout = false,
  reason: any = "Timeout",
): Promise<any> {
  return new Promise<void>((resolve, reject) => {
    let resolved = false;
    const promises = asArray(input);
    const timeout = promiseTimeout(ms, throwOnTimeout, reason).catch(e => {
      !resolved && reject(e);
    });
    const race = Promise.race([...promises, timeout]);
    race.then(resolve, reject);
    race.finally(() => {
      resolved = true;
      promises.forEach(
        // inputted promises can have .dispose() method on them,
        // it will be called when the first promise resolves, to stop the rest
        (p: any) => {
          p && typeof p === "object" && typeof p.dispose === "function" && p.dispose();
        },
      );
    });
  });
}

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
export const until = <T>(condition: Accessor<T>): Until<T> => {
  const promise = createRoot(dispose => {
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
  getOwner() && onCleanup(promise.dispose);
  return promise;
};

/**
 * A resolver for `until` that resolves when the source changes.
 * @param source a reactive source
 * @param times number of times source has to change before resolving
 */
export function changed(source: Accessor<any>, times = 1): Accessor<boolean> {
  times += 1;
  return () => {
    source();
    return !--times;
  };
}
