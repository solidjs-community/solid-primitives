import { AnyFunction, Fn, onRootCleanup } from "@solid-primitives/utils";
import {
  createRoot,
  getOwner,
  onCleanup,
  runWithOwner,
  createEffect,
  createRenderEffect,
  createComputed,
  createReaction,
  createMemo,
  createResource,
  createDeferred,
  createSelector
} from "solid-js";
import type {
  Accessor,
  Resource,
  EffectFunction,
  EffectOptions,
  MemoOptions,
  Owner,
  ResourceActions,
  ResourceFetcher,
  ResourceOptions,
  ResourceSource,
  DeferredOptions,
  EqualityCheckerFunction,
  BaseOptions
} from "solid-js/types/reactive/signal";

export type Dispose = Fn;

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
export function createSubRoot<T>(fn: (dispose: Dispose) => T, owner = getOwner()): T {
  const [dispose, returns] = createRoot(dispose => [dispose, fn(dispose)], owner ?? undefined);
  owner && runWithOwner(owner, () => onCleanup(dispose));
  return returns;
}

/**
 * A wrapper for creating callbacks with the `runWithOwner`.
 * It gives you the option to use reactive primitives after root setup and outside of effects.
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

/**
 * Solid's `createEffect` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns root dispose function
 * @see https://www.solidjs.com/docs/latest/api#createeffect
 */
export function createRootEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
  options?: EffectOptions
): Dispose;
export function createRootEffect<Next, Init = undefined>(
  ..._: undefined extends Init
    ? [fn: EffectFunction<Init | Next, Next>, value?: Init, options?: EffectOptions]
    : [fn: EffectFunction<Init | Next, Next>, value: Init, options?: EffectOptions]
): Dispose;
export function createRootEffect(...a: Parameters<typeof createEffect>): Dispose {
  return createSubRoot(dispose => {
    createEffect(...a);
    return dispose;
  });
}

/**
 * Solid's `createRenderEffect` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns root dispose function
 * @see https://www.solidjs.com/docs/latest/api#createrendereffect
 */
export function createRootRenderEffect<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
  options?: EffectOptions
): Dispose;
export function createRootRenderEffect<Next, Init = undefined>(
  ..._: undefined extends Init
    ? [fn: EffectFunction<Init | Next, Next>, value?: Init, options?: EffectOptions]
    : [fn: EffectFunction<Init | Next, Next>, value: Init, options?: EffectOptions]
): Dispose;
export function createRootRenderEffect(...a: Parameters<typeof createRenderEffect>): Dispose {
  return createSubRoot(dispose => {
    createRenderEffect(...a);
    return dispose;
  });
}

/**
 * Solid's `createComputed` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns root dispose function
 * @see https://www.solidjs.com/docs/latest/api#createcomputed
 */
export function createRootComputed<Next, Init = Next>(
  fn: EffectFunction<Init | Next, Next>,
  value: Init,
  options?: EffectOptions
): Dispose;
export function createRootComputed<Next, Init = undefined>(
  ..._: undefined extends Init
    ? [fn: EffectFunction<Init | Next, Next>, value?: Init, options?: EffectOptions]
    : [fn: EffectFunction<Init | Next, Next>, value: Init, options?: EffectOptions]
): Dispose;
export function createRootComputed(...a: Parameters<typeof createComputed>): Dispose {
  return createSubRoot(dispose => {
    createComputed(...a);
    return dispose;
  });
}

/**
 * Solid's `createReaction` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns [track function, root dispose function]
 * @see https://www.solidjs.com/docs/latest/api#createreaction
 */
export function createRootReaction(
  onInvalidate: Fn,
  options?: EffectOptions
): [track: (tracking: Fn) => void, dispose: Dispose] {
  return createSubRoot(dispose => [createReaction(onInvalidate, options), dispose]);
}

/**
 * Solid's `createDeferred` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns [track function, root dispose function]
 * @see https://www.solidjs.com/docs/latest/api#createdeferred
 */
export function createRootDeferred<T>(
  source: Accessor<T>,
  options?: DeferredOptions<T>
): [signal: Accessor<T>, dispose: Dispose] {
  return createSubRoot(dispose => [createDeferred(source, options), dispose]);
}

/**
 * Solid's `createSelector` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns ```ts
 * [(key: U) => boolean, Dispose]
 * ```
 * @see https://www.solidjs.com/docs/latest/api#createselector
 */
export function createRootSelector<T, U>(
  source: Accessor<T>,
  fn?: EqualityCheckerFunction<T, U>,
  options?: BaseOptions
): [(key: U) => boolean, Dispose] {
  return createSubRoot(dispose => [createSelector(source, fn, options), dispose]);
}

/**
 * Solid's `createMemo` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns [signal, root dispose function]
 * @see https://www.solidjs.com/docs/latest/api#creatememo
 */
export function createRootMemo<Next extends _Next, Init = Next, _Next = Next>(
  fn: EffectFunction<Init | _Next, Next>,
  value: Init,
  options?: MemoOptions<Next>
): [signal: Accessor<Next>, dispose: Dispose];
export function createRootMemo<Next extends _Next, Init = undefined, _Next = Next>(
  ..._: undefined extends Init
    ? [fn: EffectFunction<Init | _Next, Next>, value?: Init, options?: MemoOptions<Next>]
    : [fn: EffectFunction<Init | _Next, Next>, value: Init, options?: MemoOptions<Next>]
): [signal: Accessor<Next>, dispose: Dispose];
export function createRootMemo(
  ...a: Parameters<typeof createMemo>
): [signal: Accessor<unknown>, dispose: Dispose] {
  return createSubRoot(dispose => [createMemo(...a), dispose]);
}

export type DisposableResourceReturn<T> = [Resource<T>, ResourceActions<T> & { dispose: Dispose }];
/**
 * Solid's `createResource` wrapped in a sub root.
 * Can be used outside of reactive roots and the reactive computation can be manually stopped.
 * @returns ```ts
 * [Resource<T>, { mutate: Setter<T>, refetch: Fn, dispose: Fn }]
 * ```
 * @see https://www.solidjs.com/docs/latest/api#createresource
 */
export function createRootResource<T, S = true>(
  fetcher: ResourceFetcher<S, T>,
  options?: ResourceOptions<undefined>
): DisposableResourceReturn<T | undefined>;
export function createRootResource<T, S = true>(
  fetcher: ResourceFetcher<S, T>,
  options: ResourceOptions<T>
): DisposableResourceReturn<T>;
export function createRootResource<T, S>(
  source: ResourceSource<S>,
  fetcher: ResourceFetcher<S, T>,
  options?: ResourceOptions<undefined>
): DisposableResourceReturn<T | undefined>;
export function createRootResource<T, S>(
  source: ResourceSource<S>,
  fetcher: ResourceFetcher<S, T>,
  options: ResourceOptions<T>
): DisposableResourceReturn<T>;
export function createRootResource(...a: [any, any]): DisposableResourceReturn<any> {
  return createSubRoot(dispose => {
    const [data, functions] = createResource(...a);
    return [
      data,
      {
        ...functions,
        dispose
      }
    ];
  });
}
