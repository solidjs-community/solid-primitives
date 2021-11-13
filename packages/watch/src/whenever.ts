import { createMemo } from "solid-js";
import {
  StopWatch,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import { watch } from "./watch";

export function whenever<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  options?: WatchOptions
): StopWatch;

export function whenever<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
  options?: WatchOptions
): StopWatch;

export function whenever(source: any, fn: ValidWatchCallback, options?: WatchOptions): StopWatch {
  const isArray = Array.isArray(source);
  const isTrue = createMemo(() => (isArray ? source.every(a => !!a()) : !!source()));
  const _fn = (...a: [any, any, any]) => isTrue() && fn(...a);
  return watch(source, _fn, options);
}
