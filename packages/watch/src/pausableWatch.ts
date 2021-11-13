import { createSignal, Setter } from "solid-js";
import {
  Fn,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import { watch } from "./watch";

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
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  options?: WatchOptions & PausableWatchOptions
): PausableWatchReturn;

export function pausableWatch<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
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
  const _fn = (...a: [any, any, any]) => active() && fn(...a);
  const stop = watch(source, _fn, options);
  return { stop, pause, resume, toggle };
}
