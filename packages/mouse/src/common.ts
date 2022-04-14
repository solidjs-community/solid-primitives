import { createEventListener } from "@solid-primitives/event-listener";

export const addListener = (
  el: Element | Window | Document,
  ev: string,
  cb: (e: any) => void,
  options: boolean | AddEventListenerOptions = { passive: true }
): VoidFunction => createEventListener(el, ev, cb, options);
