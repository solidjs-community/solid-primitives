import { createRenderEffect, createRoot, onCleanup } from "solid-js";
import type { StopEffect, WatchOptions, ModifierReturn, EffectCallback } from "./types";
import { createComputationWatcher, Fn, parseCompositeArgs } from "./common";

/**
 * A reactive primitive, extending the `createRenderEffect` behavior with composable and reusable modifiers.
 *
 * @param modifier A function extending effect behavior. Created with `createModifier`.
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeRenderEffect(debounced(counter, n => console.log(n), 300));
 * ```
 */
export function createCompositeRenderEffect<
  Source extends Fn<any>[] | Fn<any>,
  U,
  Returns extends {}
>(modifier: ModifierReturn<Source, U, Returns>, options?: WatchOptions<U>): Returns;

/**
 * A reactive primitive, extending the `createRenderEffect` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeRenderEffect(counter, n => console.log(n), { defer: true });
 * ```
 */
export function createCompositeRenderEffect<Source extends Fn<any>[], U>(
  source: [...Source],
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U>
): void;

/**
 * A reactive primitive, extending the `createRenderEffect` behavior with composable and reusable modifiers.
 *
 * @param source - Reactive dependencies, in form an array or function *(same as in `on()`)*
 * @param callback - Callback called on source change. *(same as in `on()`)*
 * @param options - Options for the `on()` function: `{ defer:booelan }`
 *
 * @example
 * ```ts
 * createCompositeRenderEffect(counter, n => console.log(n), { defer: true });
 * ```
 */
export function createCompositeRenderEffect<Source extends Fn<any>, U>(
  source: Source,
  callback: EffectCallback<Source, U>,
  options?: WatchOptions<U>
): void;

export function createCompositeRenderEffect(...a: any): Object {
  const { source, initialCallback, options, stopRequired, modifyers } = parseCompositeArgs(a);

  const createWatcher = (stop?: StopEffect) =>
    createComputationWatcher(createRenderEffect, source, initialCallback, modifyers, options, stop);

  let returns: Record<string, any>;
  if (stopRequired) {
    const [stop, r] = createRoot(stop => {
      const [r] = createWatcher(stop);
      return [stop, r];
    });
    returns = r;
    onCleanup(stop);
  } else {
    const [r] = createWatcher();
    returns = r;
  }

  return returns;
}
