import { Accessor, createMemo, createRoot, on, onCleanup } from "solid-js";
import type { StopEffect, WatchOptions, ModifierReturn, EffectCallback } from ".";
import { Fn, parseCompositeArgs } from "./common";

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
  const {
    source,
    initialCallback,
    options: { defer, value, equals, name },
    stopRequired,
    modifyers
  } = parseCompositeArgs<MemoOptions<any>>(a);

  const returns: Record<string, any> = {};
  const createWatcher = (stop?: StopEffect): Accessor<any> => {
    // Callbacks needs to be additionally stopped after root disposal
    // because the effects tent to keep going when the reference to a source is active
    let disposed = false;
    onCleanup(() => (disposed = true));
    const fn = modifyers.reduce((fn, modifier) => {
      const [_fn, _returns] = modifier(fn, stop);
      Object.assign(returns, _returns);
      return _fn;
    }, initialCallback);
    const _fn: EffectCallback<any, any> = (a, b, c) => (!disposed ? fn(a, b, c) : c);
    return createMemo(on(source, _fn, { defer }), value, { equals, name });
  };

  let memo: Accessor<any>;

  if (stopRequired) {
    const [_memo, stop] = createRoot(stop => {
      const _memo = createWatcher(stop);
      return [_memo, stop];
    });
    onCleanup(stop);
    memo = _memo;
  } else {
    memo = createWatcher();
  }

  return modifyers.length ? [memo, returns] : memo;
}
