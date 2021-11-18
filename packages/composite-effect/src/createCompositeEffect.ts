import { createEffect, createRoot, on, onCleanup } from "solid-js";
import type { StopEffect, WatchOptions, ModifierReturn, CallbackModifier, EffectCallback } from ".";
import { Fn, withAccess } from "./common";

export function createCompositeEffect<Source extends Fn<any>[] | Fn<any>, U, Returns extends {}>(
  filter: ModifierReturn<Source, U, Returns>,
  options?: WatchOptions
): Returns;

export function createCompositeEffect<Source extends Fn<any>[], U>(
  source: [...Source],
  fn: EffectCallback<Source, U>,
  options?: WatchOptions
): void;

export function createCompositeEffect<Source extends Fn<any>, U>(
  source: Source,
  fn: EffectCallback<Source, U>,
  options?: WatchOptions
): void;

export function createCompositeEffect(...a: any): Object {
  let source: any,
    initialCallback: (a: any, b: any, c: any) => void,
    defer = false,
    stopRequired = false,
    modifyers: CallbackModifier<any, any, Object>[] = [];

  if (typeof a[1] !== "function") {
    // passed a filter
    const filter = a[0] as ModifierReturn<any, any, Object>;
    stopRequired = filter.stopRequired;
    initialCallback = filter.initialCallback;
    source = filter.initialSource;
    modifyers = filter.modifyers;
    withAccess(a[1]?.defer, v => (defer = v));
  } else {
    // passed normal arguments
    source = a[0];
    initialCallback = a[1];
    withAccess(a[2]?.defer, v => (defer = v));
  }

  const returns: Record<string, any> = {};
  const createWatcher = (stop?: StopEffect) => {
    let disposed = false;
    onCleanup(() => (disposed = true));
    const fn = modifyers.reduce((fn, modifier) => {
      const [_fn, _returns] = modifier(fn, stop);
      Object.assign(returns, _returns);
      return _fn;
    }, initialCallback);
    createEffect(on(source, (...a: [any, any, any]) => disposed || fn(...a), { defer }));
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
