import { Accessor, createSignal, onCleanup } from "solid-js";

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 */
export const createOnline = (): Accessor<boolean> => {
  const [onLine, setOnLine] = createSignal<boolean>(navigator.onLine);
  const whenOnline = () => setOnLine(true);
  const whenOffline = () => setOnLine(false);
  window.addEventListener("online", whenOnline);
  window.addEventListener("offline", whenOffline);
  onCleanup(() => {
    window.removeEventListener("online", whenOnline);
    window.removeEventListener("offline", whenOffline);
  });
  return onLine;
};
