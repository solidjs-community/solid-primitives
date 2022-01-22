import { AnyFunction, Fn, isDefined } from "@solid-primitives/utils";
import { createRoot, getOwner, onCleanup, runWithOwner as _runWithOwner } from "solid-js";
import type { Owner } from "solid-js/types/reactive/signal";

export type Dispose = Fn;
export type runWithRootReturn<T> = T extends void | undefined | null
  ? Dispose
  : [returns: T, dispose: Dispose];

/**
 * Solid's `runWithOwner` that allows `null` to be passed as an owner.
 */
export const runWithOwner = _runWithOwner as <T>(o: Owner | null, fn: () => T) => T;

/**
 * Creates a reactive **sub root**, that will be automatically disposed when it's owner does.
 *
 * @param fn
 * @param owner a root that will trigger the cleanup
 * @returns whatever the "fn" returns
 *
 * @example
 * const owner = getOwner()
 * const handleClick = () => createSubRoot(owner, () => {
 *    createEffect(() => {})
 * });
 */
export function createSubRoot<T>(fn: (dispose: Dispose) => T, owner = getOwner()): T {
  return createRoot(dispose => {
    owner && runWithOwner(owner, () => onCleanup(dispose));
    return fn(dispose);
  }, owner ?? undefined);
}

/**
 * A wrapper for creating callbacks with `runWithOwner`.
 * It gives you the option to use reactive primitives after root setup and outside of effects.
 *
 * @param callback
 * @param owner a root that will trigger the cleanup
 * @returns the callback function
 *
 * @example
 * const handleClick = createCallback(() => {
 *    createEffect(() => {})
 * })
 */
export const createCallback = <T extends AnyFunction>(
  callback: T,
  owner: Owner | null = getOwner()
): T => (owner ? (((...args) => runWithOwner(owner, () => callback(...args))) as T) : callback);

/**
 * Helper for simplifying usage of Solid's reactive primitives outside of components (reactive roots).
 *
 * @param fn will be executed immediately in a new synthetic root.
 *
 * @example
 * ```ts
 * // when fn doesn't return anything
 * const dispose = runWithRoot(() => createEffect(() => {
 *    console.log(count())
 * }));
 *
 * // when fn returns something
 * const [double, dispose] = runWithRoot(
 *    () => createMemo(() => count() * 2)
 * );
 * ```
 */
export const runWithRoot = <T>(fn: () => T, detachedOwner?: Owner): runWithRootReturn<T> =>
  createRoot(dispose => {
    const returns = fn();
    return isDefined(returns) ? [returns, dispose] : dispose;
  }, detachedOwner) as runWithRootReturn<T>;

/**
 * Helper for simplifying usage of Solid's reactive primitives outside of components (reactive roots). A **sub root** will be automatically disposed when it's owner does.
 *
 * @param fn will be executed immediately in a new **sub root**.
 *
 * @example
 * ```ts
 * // when fn doesn't return anything
 * const dispose = runWithSubRoot(() => createEffect(() => {
 *    console.log(count())
 * }));
 *
 * // when fn returns something
 * const [double, dispose] = runWithSubRoot(
 *    () => createMemo(() => count() * 2)
 * );
 * ```
 */
export const runWithSubRoot = <T>(fn: () => T, owner?: Owner | null): runWithRootReturn<T> =>
  createSubRoot(dispose => {
    const returns = fn();
    return isDefined(returns) ? [returns, dispose] : dispose;
  }, owner) as runWithRootReturn<T>;

// import { createEffect, createMemo, createResource } from "solid-js";
// const [memo, del] = runWithRoot(() => createMemo(() => 123));
// const dis = runWithRoot(() => createEffect(() => 123));
// const [[data, { refetch }], dispose] = runWithRoot(() => createResource(() => 123));
