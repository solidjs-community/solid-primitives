import { Accessor, createSignal, onCleanup } from "solid-js";

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 */
export const createConnectivitySignal = (): Accessor<boolean> => {
  const [status, setStatus] = createSignal<boolean>(navigator.onLine);
  const online = () => setStatus(true);
  const offline = () => setStatus(false);
  window.addEventListener("online", online);
  window.addEventListener("offline", offline);
  onCleanup(() => {
    window.removeEventListener("online", online);
    window.removeEventListener("offline", offline);
  });
  return status;
};
