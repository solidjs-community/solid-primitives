import { createSignal, Setter } from "solid-js";
import {
  Fn,
  ValidWatchCallback,
  WatchArrayCallback,
  WatchOptions,
  WatchSignalCallback
} from "./common";
import { watch } from "./watch";

type IgnorableWatchReturn = {
  stop: Fn;
  ignoreNext: () => void | Setter<boolean>;
  ignoring: (updater: Fn) => void;
};

export function ignorableWatch<T extends (() => any)[], U>(
  source: [...T],
  fn: WatchArrayCallback<T, U>,
  options?: WatchOptions
): IgnorableWatchReturn;

export function ignorableWatch<T extends () => any, U>(
  source: T,
  fn: WatchSignalCallback<T, U>,
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
    ignoreNext: (a?: Parameters<Setter<boolean>>[0]) => {
      typeof a === "undefined" ? setIgnore(true) : setIgnore(a);
    },
    ignoring: updater => {
      setIgnore(true);
      updater();
    },
    stop: watch(source, _fn, options)
  };
}
