import {
  StopWatch,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import { watch } from "./watch";

export function watchOnce<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  options?: WatchOptions
): StopWatch;

export function watchOnce<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
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
