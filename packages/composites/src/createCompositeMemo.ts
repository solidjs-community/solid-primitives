import { Accessor, createMemo, createRoot, onCleanup } from "solid-js";
import type { StopEffect, WatchOptions, ModifierReturn, EffectCallback } from "./types";
import { createComputationWatcher, Fn, parseCompositeArgs } from "./common";

type CustomEquals<T> = false | ((prev: T, next: T) => boolean);
interface MemoOptions<T> {
  equals?: CustomEquals<T>;
}

/**
 * A reactive primitive, extending the `createMemo` behavior with composable and reusable modifiers.
 *
 * @param modifier A function extending effect behavior. Created with `createModifier`.
 * @param options - Options for the `on()` and `createMemo()`
 *
 * @example
 * ```ts
 * const double = createCompositeMemo(debounced(counter, n => n * 2, 300));
 * ```
 */
export function createCompositeMemo<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}>(
  modifier: ModifierReturn<Source, U, Returns>,
  options?: WatchOptions<U> & MemoOptions<U>
): [Accessor<U>, Returns];

/**
 * A reactive primitive, extending the `createMemo` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` and `createMemo()`
 *
 * @example
 * ```ts
 * const double = createCompositeMemo(counter, n => n * 2, { defer: true });
 * ```
 */
export function createCompositeMemo<Source extends Fn<any>[], U>(
  source: [...Source],
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U> & MemoOptions<U>
): Accessor<U>;

/**
 * A reactive primitive, extending the `createMemo` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` and `createMemo()`
 *
 * @example
 * ```ts
 * const double = createCompositeMemo(counter, n => n * 2, { defer: true });
 * ```
 */
export function createCompositeMemo<Source extends Fn<any>, U>(
  source: Source,
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U> & MemoOptions<U>
): Accessor<U>;

export function createCompositeMemo(...a: any): Object {
  const { source, initialCallback, options, stopRequired, modifyers } = parseCompositeArgs(a);

  const createWatcher = (stop?: StopEffect) =>
    createComputationWatcher(createMemo, source, initialCallback, modifyers, options, stop);

  let memo: Accessor<any>;
  let returns: Record<string, any>;

  if (stopRequired) {
    const [_memo, stop, r] = createRoot(stop => {
      const [r, _memo] = createWatcher(stop);
      return [_memo, stop, r];
    });
    onCleanup(stop);
    returns = r;
    memo = _memo;
  } else {
    const [r, _memo] = createWatcher();
    memo = _memo;
    returns = r;
  }

  return modifyers.length ? [memo, returns] : memo;
}
