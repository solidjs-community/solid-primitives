import type { Accessor, ReturnTypes } from "solid-js";

export type Fn<R = void> = () => R;
/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never;
export type MaybeAccessor<T> = T | Accessor<T>;
export const read = <T>(val: MaybeAccessor<T>): T =>
  typeof val === "function" ? (val as Function)() : val;

export const promiseTimeout = (
  ms: number,
  throwOnTimeout = false,
  reason = "Timeout"
): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

export type StopWatch = Fn;

export type WatchOptions = {
  name?: string; // from createEffect
  defer?: boolean; // from on
};

export type ValidWatchCallback = (input: any, prevInput: any, prevValue?: any) => any;

export type WatchArrayCallback<T extends (() => any)[], U> = (
  input: ReturnTypes<T>,
  prevInput: ReturnTypes<T>,
  prevValue?: U
) => U;

export type WatchSignalCallback<T extends () => any, U> = (
  input: ReturnType<T>,
  prevInput: ReturnType<T>,
  prevValue?: U
) => U;
