import { ReturnTypes } from "solid-js";
import { ElementOf, Fn, MaybeAccessor, promiseTimeout, read } from "./common";
import { watch } from "./watch";

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
  source: [...T]
): UntilArrayInstance<ReturnTypes<T>>;

export function until<T extends () => any[], U>(source: T): UntilArrayInstance<ReturnType<T>>;

export function until<T extends (() => any)[], U>(
  source: [...T]
): UntilValueInstance<ReturnTypes<T>>;

export function until<T extends () => any, U>(source: T): UntilValueInstance<ReturnType<T>>;

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
