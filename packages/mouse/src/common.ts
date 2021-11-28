import { Fn } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export const isClient = typeof window !== "undefined";

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
