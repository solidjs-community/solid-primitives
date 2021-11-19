import { Accessor, createComputed, createEffect, createMemo, on, onCleanup } from "solid-js";
import { WatchOptions } from ".";
import type {
  CallbackModifier,
  EffectCallback,
  EffectSource,
  ModifierReturn,
  StopEffect
} from "./types";

//
// GENERAL HELPERS:
//

export type Fn<R = void> = () => R;
/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never;
export type MaybeAccessor<T> = T | Accessor<T>;

export const access = <T>(v: MaybeAccessor<T>): T => (typeof v === "function" ? (v as any)() : v);

export const accessAsArray = <T>(value: MaybeAccessor<T[] | T>): T[] => {
  const _value = access(value);
  return Array.isArray(_value) ? _value : [_value];
};

export const withAccess = <T>(value: MaybeAccessor<T>, fn: (value: NonNullable<T>) => void) => {
  const _value = access(value);
  if (typeof _value !== "undefined" && _value !== null) fn(_value as NonNullable<T>);
};

export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

//
// PRIMITIVE SPECIFIC HELPERS:
//
export const parseCompositeArgs = <O extends {}>(a: [any, any, any]) => {
  let source: any,
    initialCallback: (a: any, b: any, c: any) => void,
    options = {} as WatchOptions<any> & O,
    stopRequired = false,
    modifyers: CallbackModifier<any, any, Object>[] = [];

  if (typeof a[1] !== "function") {
    // passed a filter
    const filter = a[0] as ModifierReturn<any, any, Object>;
    stopRequired = filter.stopRequired;
    initialCallback = filter.initialCallback;
    source = filter.initialSource;
    modifyers = filter.modifyers;
    withAccess(a[1], o => (options = o));
  } else {
    // passed normal arguments
    source = a[0];
    initialCallback = a[1];
    withAccess(a[2], o => (options = o));
  }

  return {
    source,
    initialCallback,
    options,
    stopRequired,
    modifyers
  };
};

export const createComputationWatcher = <O extends Object>(
  computation: Function,
  source: EffectSource<any, any>,
  initialCallback: EffectCallback<any, any>,
  modifyers: CallbackModifier<any, any, Object>[],
  options: WatchOptions<any> & O,
  stop?: StopEffect
) => {
  const returns: Record<string, any> = {};
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
  return [returns, computation(on(source, _fn, options), options.value, options)];
};
