import { isFunction } from "./assertion";

/**
 * A function that does nothing.
 */
export function noop() {
  return;
}

/**
 * Run with the given args if it's a function, return it otherwise.
 */
export function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}
