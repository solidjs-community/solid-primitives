import { Accessor, createSignal } from "solid-js";
import {
  Fn,
  MaybeAccessor,
  read,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import { watch } from "./watch";

export type WatchAtMostReturn = {
  stop: Fn;
  count: Accessor<number>;
};

export function watchAtMost<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  max: MaybeAccessor<number>,
  options?: WatchOptions
): WatchAtMostReturn;

export function watchAtMost<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
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
