import { createEventListener } from "@solid-primitives/event-listener";
import { Accessor, createSignal } from "solid-js";

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 */
export const createConnectivity = (): Accessor<boolean> => {
  const [status, setStatus] = createSignal<boolean>(navigator.onLine);
  createEventListener(window, "online", () => setStatus(true));
  createEventListener(window, "offline", () => setStatus(false));
  return status;
};
