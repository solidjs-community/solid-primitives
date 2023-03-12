import { createRoot, getOwner, onCleanup, runWithOwner, Owner, sharedConfig } from "solid-js";
import { AnyFunction, asArray, access } from "@solid-primitives/utils";

/**
 * Creates a reactive **sub root**, that will be automatically disposed when it's owner does.
 *
 * @param fn a function in which the reactive state is scoped
 * @param owners reactive root dependency list – cleanup of any of them will trigger sub-root disposal. (Defaults to `getOwner()`)
 * @returns return values of {@link fn}
 *
 * @example
 * const owner = getOwner()
 * const [dispose, memo] = createSubRoot(dispose => {
 *    const memo = createMemo(() => {...})
 *    onCleanup(() => {...}) // <- will cleanup when branch/owner disposes
 *    return [dispose, memo]
 * }, owner, owner2);
 */
export function createSubRoot<T>(fn: (dispose: VoidFunction) => T, ...owners: (typeof Owner)[]): T {
  if (owners.length === 0) owners = [getOwner()];
  return createRoot(dispose => {
    asArray(access(owners)).forEach(
      owner => owner && runWithOwner(owner, onCleanup.bind(void 0, dispose)),
    );
    return fn(dispose);
  }, owners[0]);
}

/** @deprecated Renamed to `createSubRoot` */
export const createBranch = createSubRoot;

/**
 * A wrapper for creating callbacks with `runWithOwner`.
 * It gives you the option to use reactive primitives after root setup and outside of effects.
 *
 * @param callback function that will be ran with owner once called
 * @param owner a root that will trigger the cleanup (Defaults to `getOwner()`)
 * @returns the {@link callback} function
 *
 * @example
 * const handleClick = createCallback(() => {
 *    createEffect(() => {})
 * })
 */
export const createCallback = <T extends AnyFunction>(
  callback: T,
  owner: Owner | null = getOwner(),
): T => (owner ? (((...args) => runWithOwner(owner, () => callback(...args))) as T) : callback);

/**
 * Executes {@link fn} in a {@link createSubRoot} *(auto-disposing root)*, and returns a dispose function, to dispose computations used inside before automatic cleanup.
 *
 * @param fn a function in which the reactive state is scoped
 * @returns root dispose function
 *
 * @example
 * ```ts
 * const dispose = createDisposable(dispose => {
 *    createEffect(() => {...})
 * });
 * // dispose later (if not, will dispose automatically)
 * dispose()
 * ```
 */
export function createDisposable(
  fn: (dispose: VoidFunction) => void,
  ...owners: (Owner | null)[]
): VoidFunction {
  return createSubRoot(dispose => {
    fn(dispose);
    return dispose;
  }, ...owners);
}

/**
 * Creates a reactive root that is shared across every instance it was used in. Singleton root gets created when the returned function gets first called, and disposed when last reactive context listening to it gets disposed. Only to be recreated again when a new listener appears.
 * @param factory function where you initialize your reactive primitives
 * @returns function, registering reactive owner as one of the listeners, returns the value {@link factory} returned.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/rootless#createSingletonRoot
 * @example
 * const useState = createSingletonRoot(() => {
 *    return createMemo(() => {...})
 * });
 *
 * // later in a component:
 * const state = useState();
 * state()
 *
 * // in another component
 * // previously created primitive would get reused
 * const state = useState();
 * ...
 */
export function createSingletonRoot<T>(
  factory: (dispose: VoidFunction) => T,
  detachedOwner: Owner | null = getOwner(),
): () => T {
  let listeners = 0,
    value: T | undefined,
    disposeRoot: VoidFunction | undefined;

  return () => {
    listeners++;
    onCleanup(() => {
      listeners--;
      queueMicrotask(() => {
        if (!listeners && disposeRoot) {
          disposeRoot();
          disposeRoot = value = undefined;
        }
      });
    });

    if (!disposeRoot) {
      createRoot(dispose => (value = factory((disposeRoot = dispose))), detachedOwner);
    }

    return value!;
  };
}

/** @deprecated Renamed to `createSingletonRoot` */
export const createSharedRoot = createSingletonRoot;

/**
 * @warning Experimental API - there might be a better way so solve singletons with SSR and hydration.
 *
 * A hydratable version of {@link createSingletonRoot}.
 * It will create a singleton root, unless it's running in SSR or during hydration.
 * Then it will deopt to a calling the {@link factory} function with a regular root.
 * @param factory function where you initialize your reactive primitives
 * @returns
 * ```ts
 * // function that returns the value returned by factory
 * () => T
 * ```
 */
export function createHydratableSingletonRoot<T>(factory: (dispose: VoidFunction) => T): () => T {
  const owner = getOwner();
  const singleton = createSingletonRoot(factory, owner);
  return () => (process.env.SSR || sharedConfig.context ? createRoot(factory, owner) : singleton());
}
