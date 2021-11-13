import { createEffect, createRoot, on, onCleanup } from "solid-js";
import {
  StopWatch,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";

export function watch<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  options?: WatchOptions
): StopWatch;

export function watch<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
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
