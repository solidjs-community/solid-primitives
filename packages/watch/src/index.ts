import { debounce, throttle } from "lodash";
import type { DebounceSettings, ThrottleSettings } from "lodash";
import { on, createEffect, createRoot, onCleanup, createSignal, createMemo } from "solid-js";
import type { ReturnTypes, Accessor, Setter } from "solid-js";

type Fn<R = void> = () => R;
/**
 * Infers the element type of an array
 */
type ElementOf<T> = T extends (infer E)[] ? E : never;
type MaybeAccessor<T> = T | Accessor<T>;
const read = <T>(val: MaybeAccessor<T>): T =>
  typeof val === "function" ? (val as Function)() : val;

const promiseTimeout = (ms: number, throwOnTimeout = false, reason = "Timeout"): Promise<void> =>
  new Promise((resolve, reject) =>
    throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms)
  );

export type StopWatch = Fn;

export type WatchOptions = {
  name?: string; // from createEffect
  defer?: boolean; // from on
};

type ValidWatchCallback = (input: any, prevInput: any, prevValue?: any) => any;

interface WatchArrayParams<T extends (() => any)[], U> {
  source: [...T];
  fn: (input: ReturnTypes<T>, prevInput: ReturnTypes<T>, prevValue?: U) => U;
}
interface WatchSignalParams<T extends () => any, U> {
  source: T;
  fn: (input: ReturnType<T>, prevInput: ReturnType<T>, prevValue?: U) => U;
}

export function watch<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function watch<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function watch(source: any, fn: ValidWatchCallback, options: WatchOptions = {}): StopWatch {
  const stop = createRoot(stop => {
    const { defer = true } = options;
    createEffect(on(source, fn, { defer }), options);
    return stop;
  });
  onCleanup(stop);
  return stop;
}

export function debouncedWatch<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  wait: number,
  options?: WatchOptions & DebounceSettings
): StopWatch;
export function debouncedWatch<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  wait: number,
  options?: WatchOptions & DebounceSettings
): StopWatch;
export function debouncedWatch(
  source: any,
  fn: ValidWatchCallback,
  wait: number,
  options?: WatchOptions & DebounceSettings
): StopWatch {
  const debouncedFn = debounce(fn, wait, options);
  return watch(source, debouncedFn, options);
}

export function throttledWatch<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  wait: number,
  options?: WatchOptions & ThrottleSettings
): StopWatch;
export function throttledWatch<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  wait: number,
  options?: WatchOptions & ThrottleSettings
): StopWatch;
export function throttledWatch(
  source: any,
  fn: ValidWatchCallback,
  wait: number,
  options?: WatchOptions & ThrottleSettings
): StopWatch {
  const throttledFn = throttle(fn, wait, options);
  return watch(source, throttledFn, options);
}

export type PausableWatchReturn = {
  stop: Fn;
  pause: Fn;
  resume: Fn;
  toggle: Setter<boolean>;
};

export type PausableWatchOptions = {
  active?: boolean;
};

export function pausableWatch<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  options?: WatchOptions & PausableWatchOptions
): PausableWatchReturn;
export function pausableWatch<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  options?: WatchOptions & PausableWatchOptions
): PausableWatchReturn;
export function pausableWatch(
  source: any,
  fn: ValidWatchCallback,
  options: WatchOptions & PausableWatchOptions = {}
): PausableWatchReturn {
  const [active, toggle] = createSignal(options.active ?? true);
  const pause = () => toggle(false);
  const resume = () => toggle(true);
  const _fn = (...args: [any, any, any]) => active() && fn(...args);
  const stop = watch(source, _fn, options);
  return { stop, pause, resume, toggle };
}

export function watchOnce<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function watchOnce<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function watchOnce(source: any, fn: ValidWatchCallback, options?: WatchOptions): StopWatch {
  const stop = watch(
    source,
    (...a: [any, any, any]) => {
      stop();
      fn(...a);
    },
    options
  );
  return stop;
}

export type WatchAtMostReturn = {
  stop: Fn;
  count: Accessor<number>;
};

export function watchAtMost<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  max: MaybeAccessor<number>,
  options?: WatchOptions
): WatchAtMostReturn;
export function watchAtMost<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  max: MaybeAccessor<number>,
  options?: WatchOptions
): WatchAtMostReturn;
export function watchAtMost(
  source: any,
  fn: ValidWatchCallback,
  max: MaybeAccessor<number>,
  options?: WatchOptions
): WatchAtMostReturn {
  const [count, setCount] = createSignal(1);
  const stop = watch(
    source,
    (...a: [any, any, any]) => {
      setCount(p => p + 1);
      fn(...a);
      count() >= read(max) && stop();
    },
    options
  );
  return { stop, count };
}

type IgnorableWatchReturn = {
  stop: Fn;
  ignore: () => void | Setter<boolean>;
  ignoring: (updater: Fn) => void;
};

export function ignorableWatch<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  options?: WatchOptions
): IgnorableWatchReturn;
export function ignorableWatch<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  options?: WatchOptions
): IgnorableWatchReturn;
export function ignorableWatch(
  source: any,
  fn: ValidWatchCallback,
  options?: WatchOptions
): IgnorableWatchReturn {
  const [ignore, setIgnore] = createSignal(false);
  const _fn = (...a: [any, any, any]) => (ignore() ? setIgnore(false) : fn(...a));
  return {
    ignore: (a?: Parameters<Setter<boolean>>[0]) => {
      typeof a === "undefined" ? setIgnore(true) : setIgnore(a);
    },
    ignoring: updater => {
      setIgnore(true);
      updater();
    },
    stop: watch(source, _fn, options)
  };
}

export function whenever<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"],
  fn: WatchArrayParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function whenever<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"],
  fn: WatchSignalParams<T, U>["fn"],
  options?: WatchOptions
): StopWatch;
export function whenever(source: any, fn: ValidWatchCallback, options?: WatchOptions): StopWatch {
  const isArray = Array.isArray(source);
  const isTrue = createMemo(() => (isArray ? source.every(a => !!a()) : !!source()));
  const _fn = (...a: [any, any, any]) => isTrue() && fn(...a);
  return watch(source, _fn, options);
}

export interface UntilToMatchOptions {
  /**
   * Milliseconds timeout for promise to resolve/reject if the when condition does not meet.
   * 0 for never timed out
   *
   * @default 0
   */
  timeout?: number;
  /**
   * Reject the promise when timeout
   *
   * @default false
   */
  throwOnTimeout?: boolean;
}
export interface UntilBaseInstance<T> {
  toMatch(condition: (v: T) => boolean, options?: UntilToMatchOptions): Promise<void>;
  changed(options?: UntilToMatchOptions): Promise<void>;
  changedTimes(n?: number, options?: UntilToMatchOptions): Promise<void>;
}
export interface UntilValueInstance<T> extends UntilBaseInstance<T> {
  readonly not: UntilValueInstance<T>;
  toBe<P = T>(value: MaybeAccessor<T | P>, options?: UntilToMatchOptions): Promise<void>;
  toBeTruthy(options?: UntilToMatchOptions): Promise<void>;
  toBeNull(options?: UntilToMatchOptions): Promise<void>;
  toBeUndefined(options?: UntilToMatchOptions): Promise<void>;
  toBeNaN(options?: UntilToMatchOptions): Promise<void>;
}
export interface UntilArrayInstance<T> extends UntilBaseInstance<T> {
  readonly not: UntilArrayInstance<T>;
  toInclude(value: MaybeAccessor<ElementOf<T>>, options?: UntilToMatchOptions): Promise<void>;
}

export function until<T extends (() => any[])[], U>(
  source: WatchArrayParams<T, U>["source"]
): UntilArrayInstance<ReturnTypes<T>>;

export function until<T extends () => any[], U>(
  source: WatchSignalParams<T, U>["source"]
): UntilArrayInstance<ReturnType<T>>;

export function until<T extends (() => any)[], U>(
  source: WatchArrayParams<T, U>["source"]
): UntilValueInstance<ReturnTypes<T>>;

export function until<T extends () => any, U>(
  source: WatchSignalParams<T, U>["source"]
): UntilValueInstance<ReturnType<T>>;

export function until(
  source: any
): UntilBaseInstance<any> & UntilValueInstance<any> & UntilArrayInstance<any> {
  let isNot = false;

  function toMatch(
    condition: (v: any) => boolean,
    { timeout, throwOnTimeout }: UntilToMatchOptions = {}
  ): Promise<void> {
    let stop: Fn;
    const watcher = new Promise<void>(resolve => {
      stop = watch(source, v => {
        if (condition(v) === !isNot) {
          stop();
          resolve();
        }
      });
    });
    const promises = [watcher];
    if (timeout) promises.push(promiseTimeout(timeout, throwOnTimeout).finally(() => stop()));

    return Promise.race(promises);
  }

  function changed(options?: UntilToMatchOptions) {
    return changedTimes(1, options);
  }

  function changedTimes(n = 1, options?: UntilToMatchOptions) {
    let count = -1; // skip the immediate check
    return toMatch(() => ++count >= n, options);
  }

  function toInclude(value: any, options?: UntilToMatchOptions) {
    return toMatch((v: any[]) => Array.from(v).includes(read(value)), options);
  }

  function toBe(value: MaybeAccessor<any>, options?: UntilToMatchOptions) {
    return toMatch(is => is === read(value), options);
  }

  function toBeTruthy(options?: UntilToMatchOptions) {
    return toMatch(v => !!v, options);
  }

  function toBeNull(options?: UntilToMatchOptions) {
    return toBe(null, options);
  }

  function toBeUndefined(options?: UntilToMatchOptions) {
    return toBe(undefined, options);
  }

  function toBeNaN(options?: UntilToMatchOptions) {
    return toMatch(Number.isNaN, options);
  }

  return {
    toMatch,
    changed,
    changedTimes,
    toInclude,
    toBe,
    toBeTruthy,
    toBeNull,
    toBeUndefined,
    toBeNaN,
    get not() {
      isNot = !isNot;
      return this;
    }
  };
}
