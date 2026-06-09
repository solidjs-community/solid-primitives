import {
  type Accessor,
  createEffect,
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
    let settled = false;
    const promises = asArray(input);
    const timeout = promiseTimeout(ms, throwOnTimeout, reason).catch(e => {
      !settled && reject(e);
    });
    const race = Promise.race([...promises, timeout]);
    race.then(resolve, reject);
    race.finally(() => {
      settled = true;
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

// .dispose() method is for disposing of the root from outside;
// raceTimeout calls it when the first promise resolves
export type Until<T> = Promise<Truthy<T>> & { dispose: VoidFunction };

// Like Until<T> but resolves with an array of truthy values — one per condition
export type UntilAll<T> = Promise<Truthy<T>[]> & { dispose: VoidFunction };

/**
 * Promised one-time watch for changes. Await a reactive condition.
 *
 * @param condition a signal or a reactive condition, which will resolve the promise if truthy
 * @returns A promise that resolves with the truthy value of the condition, or rejects when its root is disposed.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/until#readme
 *
 * @example
 * const [count, setCount] = createSignal(0)
 * await until(() => count() > 5)
 *
 * // gate before async work inside an async createMemo
 * const data = createMemo(async () => {
 *   await until(() => isAuthenticated())
 *   return fetchProtectedData()
 * })
 */
export const until = <T>(condition: Accessor<T>): Until<T> => {
  const promise = createRoot(dispose => {
    const memo = createMemo(condition);
    const promise = new Promise<Truthy<T>>((resolve, reject) => {
      createEffect(
        () => memo(),
        value => {
          if (!value) return;
          resolve(value as Truthy<T>);
          dispose();
        },
      );
      onCleanup(reject);
    }) as Until<T>;
    promise.dispose = dispose;
    return promise;
  });
  getOwner() && onCleanup(promise.dispose);
  return promise;
};

/**
 * Resolves when **all** reactive conditions are simultaneously truthy — the reactive equivalent of `Promise.all`.
 *
 * Resolves with an array of each condition's truthy value, in the same order as the input.
 * Rejects if the parent owner is disposed before all conditions are met.
 * An empty conditions array resolves immediately with `[]`.
 *
 * @param conditions array of signals or reactive conditions
 * @returns A promise with a `.dispose()` method to stop watching early
 *
 * @example
 * const [auth, setAuth] = createSignal(false)
 * const [config, setConfig] = createSignal(false)
 *
 * await untilAll([auth, config])
 *
 * // as a gate inside an async createMemo
 * const report = createMemo(async () => {
 *   await untilAll([() => auth.ready(), () => config.loaded()])
 *   return generateReport()
 * })
 */
export const untilAll = <T>(conditions: readonly Accessor<T>[]): UntilAll<T> => {
  if (!conditions.length) {
    const p = Promise.resolve([] as Truthy<T>[]) as UntilAll<T>;
    p.dispose = () => {};
    return p;
  }
  const promise = createRoot(dispose => {
    const memos = conditions.map(c => createMemo(c));
    const promise = new Promise<Truthy<T>[]>((resolve, reject) => {
      createEffect(
        () => memos.map(m => m()),
        values => {
          if (values.every(Boolean)) {
            resolve(values as Truthy<T>[]);
            dispose();
          }
        },
      );
      onCleanup(reject);
    }) as UntilAll<T>;
    promise.dispose = dispose;
    return promise;
  });
  getOwner() && onCleanup(promise.dispose);
  return promise;
};

/**
 * Resolves when **any** reactive condition becomes truthy — the reactive equivalent of `Promise.any`.
 *
 * Resolves with the first truthy value encountered.
 * Rejects if the parent owner is disposed before any condition is met.
 * An empty conditions array produces a promise that never resolves (mirrors `Promise.race([])`).
 *
 * @param conditions array of signals or reactive conditions
 * @returns A promise with a `.dispose()` method to stop watching early
 *
 * @example
 * const [primary, setPrimary] = createSignal(false)
 * const [fallback, setFallback] = createSignal(false)
 *
 * const first = await untilAny([primary, fallback])
 */
export const untilAny = <T>(conditions: readonly Accessor<T>[]): Until<T> => {
  if (!conditions.length) {
    let rej!: (reason?: unknown) => void;
    const p = new Promise<Truthy<T>>((_resolve, reject) => {
      rej = reject;
    }) as Until<T>;
    p.dispose = () => rej();
    return p;
  }
  const promise = createRoot(dispose => {
    const memos = conditions.map(c => createMemo(c));
    const promise = new Promise<Truthy<T>>((resolve, reject) => {
      createEffect(
        () => memos.map(m => m()),
        values => {
          const idx = values.findIndex(v => v);
          if (idx !== -1) {
            resolve(values[idx] as Truthy<T>);
            dispose();
          }
        },
      );
      onCleanup(reject);
    }) as Until<T>;
    promise.dispose = dispose;
    return promise;
  });
  getOwner() && onCleanup(promise.dispose);
  return promise;
};

export type RetryOptions = {
  /** Maximum number of attempts. Defaults to `3`. */
  times?: number;
  /**
   * Milliseconds to wait between attempts. Pass a function for dynamic delay,
   * e.g. exponential backoff: `attempt => 100 * 2 ** attempt`
   */
  delay?: number | ((attempt: number) => number);
  /** Return `false` to stop retrying immediately and rethrow the error. Defaults to always retry. */
  shouldRetry?: (error: unknown) => boolean;
};

/**
 * Calls `fn` up to `times` times, retrying on failure.
 *
 * Pure utility — no Solid reactivity required. Composes naturally with `async createMemo`:
 * ```ts
 * const data = createMemo(async () =>
 *   retry(() => fetch('/api/data').then(r => r.json()), { times: 3, delay: 500 })
 * )
 * ```
 *
 * @param fn async function to call
 * @param options retry configuration
 *
 * @example
 * // exponential backoff
 * const data = await retry(fetchData, {
 *   times: 5,
 *   delay: attempt => 100 * 2 ** attempt,
 *   shouldRetry: err => err.status !== 401,
 * })
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { times = 3, delay = 0, shouldRetry = () => true } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt < times; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!shouldRetry(err)) throw err;
      if (attempt < times - 1 && delay) {
        const ms = typeof delay === "function" ? delay(attempt) : delay;
        if (ms > 0) await promiseTimeout(ms);
      }
    }
  }
  throw lastError;
}

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
