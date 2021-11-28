import { Fn, ItemsOf } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export const isClient = typeof window !== "undefined";

export const objectOmit = <T extends Object, K extends Array<keyof T>>(
  object: T,
  ...keys: K
): Omit<T, ItemsOf<K>> => {
  const copy = Object.assign({}, object);
  for (const key of keys) {
    delete copy[key];
  }
  return copy;
};

// Had to create my own createEventListener, because  @solid-primitives/event-listener had some troubles working
export const addListener = (
  el: Element | Window | Document,
  ev: string,
  cb: (e: any) => void,
  options: boolean | AddEventListenerOptions = { passive: true }
): Fn => {
  el.addEventListener(ev, cb, options);
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    el.removeEventListener(ev, cb, options);
  };
  onCleanup(cleanup);
  return cleanup;
};
