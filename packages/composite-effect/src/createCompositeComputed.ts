import { createComputed, createRoot, on, onCleanup } from "solid-js";
import type { StopEffect, WatchOptions, ModifierReturn, EffectCallback } from ".";
import { Fn, parseCompositeArgs } from "./common";

/**
 * A reactive primitive, extending the `createComputed` behavior with composable and reusable modifiers.
 *
 * @param modifier A function extending effect behavior. Created with `createModifier`.
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeComputed(debounced(counter, n => console.log(n), 300));
 * ```
 */
export function createCompositeComputed<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}>(
  modifier: ModifierReturn<Source, U, Returns>,
  options?: WatchOptions<U>
): Returns;

/**
 * A reactive primitive, extending the `createComputed` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeComputed(counter, n => console.log(n), { defer: true });
 * ```
 */
export function createCompositeComputed<Source extends Fn<any>[], U>(
  source: [...Source],
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U>
): void;

/**
 * A reactive primitive, extending the `createComputed` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeComputed(counter, n => console.log(n), { defer: true });
 * ```
 */
export function createCompositeComputed<Source extends Fn<any>, U>(
  source: Source,
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U>
): void;

export function createCompositeComputed(...a: any): Object {
  const {
    source,
    initialCallback,
    options: { defer, value, name },
    stopRequired,
    modifyers
  } = parseCompositeArgs(a);

  const returns: Record<string, any> = {};
  const createWatcher = (stop?: StopEffect) => {
    // Callbacks needs to be additionally stopped after root disposal
    // because the effects tent to keep going when the reference to a source is active
    let disposed = false;
    onCleanup(() => (disposed = true));
    const fn = modifyers.reduce((fn, modifier) => {
      const [_fn, _returns] = modifier(fn, stop);
      Object.assign(returns, _returns);
      return _fn;
    }, initialCallback);
    const _fn: EffectCallback<any, any> = (a, b, c) => disposed || fn(a, b, c);
    createComputed(on(source, _fn, { defer }), value, { name });
  };

  if (stopRequired) {
    const stop = createRoot(stop => {
      createWatcher(stop);
      return stop;
    });
    onCleanup(stop);
  } else {
    createWatcher();
  }

  return returns;
}
