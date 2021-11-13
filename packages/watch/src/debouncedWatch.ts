import {
  StopWatch,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import debounce from "@solid-primitives/debounce";
import { watch } from "./watch";
import { onCleanup } from "solid-js";

export function debouncedWatch<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  wait: number,
  options?: WatchOptions
): StopWatch;

export function debouncedWatch<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
  wait: number,
  options?: WatchOptions
): StopWatch;

export function debouncedWatch(
  source: any,
  fn: ValidWatchCallback,
  wait: number,
  options?: WatchOptions
): StopWatch {
  const [_fn, clear] = debounce(fn, wait);
  onCleanup(clear);
  const stopWatch = watch(source, _fn, options);
  return () => {
    stopWatch();
    clear();
  };
}
