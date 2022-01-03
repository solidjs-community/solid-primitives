import { createEventListenerMap } from "@solid-primitives/event-listener";
import { Accessor, createSignal } from "solid-js";

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 */
export const createConnectivity = (): Accessor<boolean> => {
  const [onLine, setOnLine] = createSignal<boolean>(navigator.onLine);
  createEventListenerMap(window, {
    online: () => setOnLine(true),
    offline: () => setOnLine(false)
  });
  return onLine;
};
