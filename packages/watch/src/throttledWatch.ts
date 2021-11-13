import {
  StopWatch,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import throttle from "@solid-primitives/throttle";
import { watch } from "./watch";
import { onCleanup } from "solid-js";

export function throttledWatch<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  wait: number,
  options?: WatchOptions
): StopWatch;

export function throttledWatch<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
  wait: number,
  options?: WatchOptions
): StopWatch;

export function throttledWatch(
  source: any,
  fn: ValidWatchCallback,
  wait: number,
  options?: WatchOptions
): StopWatch {
  const [_fn, clear] = throttle(fn, wait);
  onCleanup(clear);
  const stopWatch = watch(source, _fn, options);
  return () => {
    stopWatch();
    clear();
  };
}
