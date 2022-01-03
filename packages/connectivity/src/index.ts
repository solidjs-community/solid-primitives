import { Accessor, createSignal, onCleanup } from "solid-js";

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 */
export const createConnectivity = (): Accessor<boolean> => {
  const [onLine, setOnLine] = createSignal<boolean>(navigator.onLine);
  const online = () => setOnLine(true);
  const offline = () => setOnLine(false);
  window.addEventListener("online", online);
  window.addEventListener("offline", offline);
  onCleanup(() => {
    window.removeEventListener("online", online);
    window.removeEventListener("offline", offline);
  });
  return onLine;
};
