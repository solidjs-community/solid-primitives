import { AnyFunction, Fn, onRootCleanup } from "@solid-primitives/utils";
import { createRoot, getOwner, onCleanup, runWithOwner } from "solid-js";
import { Owner } from "solid-js/types/reactive/signal";

// I kept onRootCleanup in the utils, instead of in here,
// because it's usage is mostly for making primitives
export { onRootCleanup };

/**
 * Creates a reactive root, which will be disposed when the passed owner does.
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
export function createSubRoot<T>(fn: (dispose: Fn) => T, owner = getOwner()): T {
  const [dispose, returns] = createRoot(dispose => [dispose, fn(dispose)], owner ?? undefined);
  owner && runWithOwner(owner, () => onCleanup(dispose));
  return returns;
}

/**
 * A wrapper for creating callbacks with the `runWithOwner`
 *
 * @param callback
 * @param owner a root that will trigger the cleanup
 * @returns the callback function
 *
 * @example
 * const handleClick = createCallbackWithOwner(() => {
 *    createEffect(() => {})
 * })
 */
export const createCallbackWithOwner = <T extends AnyFunction>(
  callback: T,
  owner: Owner | null = getOwner()
): T => (owner ? (((...args) => runWithOwner(owner, () => callback(...args))) as T) : callback);
