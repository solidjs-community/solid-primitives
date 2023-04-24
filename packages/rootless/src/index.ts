import {
  createRoot,
  getOwner,
  onCleanup,
  runWithOwner,
  Owner,
  sharedConfig,
  Accessor,
  Suspense,
  createResource,
  createRenderEffect,
  createSignal,
  Signal,
  batch,
  Setter,
} from "solid-js";
import { isServer } from "solid-js/web";
import { AnyFunction, asArray, access, noop, createMicrotask } from "@solid-primitives/utils";

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
  return () => (isServer || sharedConfig.context ? createRoot(factory, owner) : singleton());
}

export function createSuspense<T>(when: Accessor<boolean>, fn: () => T): T {
  let value: T,
    resolve = noop;

  const [resource] = createResource(
    () => when() || resolve(),
    () => new Promise<void>(r => (resolve = r)),
  );

  Suspense({
    // @ts-expect-error children don't have to return shit
    get children() {
      createRenderEffect(resource);
      value = fn();
    },
  });

  return value!;
}

const disposeAll = (list: { dispose: VoidFunction }[]) => {
  for (const item of list) item.dispose();
};

// TODO
// - suspend in batch
// - prefill cache

export type RootPoolOptions = {
  limit?: number;
  suspend?: boolean;
};

export function createRootPool<TResult>(
  fn: () => TResult,
  options?: RootPoolOptions,
): () => TResult;
export function createRootPool<TArg, TResult>(
  fn: (args: Accessor<TArg>) => TResult,
  options?: RootPoolOptions,
): (args: TArg) => TResult;
export function createRootPool<TArg, TResult>(
  fn: (args: Accessor<TArg>) => TResult,
  options: RootPoolOptions = {},
): (args: TArg) => TResult {
  type Root = { v: TResult; set: Setter<TArg>; dispose(): void; suspend(on: boolean): void };

  // let toSuspend = 0;
  const { limit = 1000 } = options,
    pool: Root[] = [],
    owner = getOwner(),
    mapRoot: (dispose: VoidFunction, signal: Signal<TArg>) => Root = options.suspend
      ? (dispose, [args, set]) => {
          const [suspended, suspend] = createSignal(false);
          return {
            dispose,
            set,
            suspend,
            v: createSuspense(suspended, () => fn(args)),
          };
        }
      : (dispose, [args, set]) => ({ v: fn(args), set, dispose, suspend: noop }),
    limitPool = createMicrotask(
      () => pool.length > limit && disposeAll(pool.splice(0, pool.length - limit)),
    );

  onCleanup(() => {
    disposeAll(pool);
    // pool.length = toSuspend = 0;
    pool.length = 0;
  });

  return arg => {
    let root: Root;

    if (pool.length) {
      (root = pool.pop()!).set(() => arg);
      root.suspend(false);
    } else root = createRoot(dispose => mapRoot(dispose, createSignal(arg)), owner);

    onCleanup(() => {
      pool.push(root);
      root.suspend(true);
      // toSuspend++;
      limitPool();
    });

    return root.v;
  };
}
