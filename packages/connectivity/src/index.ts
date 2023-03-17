import { makeEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createHydratableSignal, trueFn } from "@solid-primitives/utils";
import { Accessor } from "solid-js";

/**
 * Attaches event listeners and fires callback whenever `window.onLine` changes.
 * @param callback fired whenever `window.onLine` changes
 * @returns function clearing event listeners
 * @example
 * const clear = makeConnectivityListener(isOnline => {
 *    console.log(isOnline) // T: booelan
 * });
 * // remove event listeners (happens also on cleanup)
 * clear()
 */
export function makeConnectivityListener(callback: (isOnline: boolean) => void): VoidFunction {
  if (process.env.SSR) {
    return () => {};
  }
  const clear1 = makeEventListener(window, "online", callback.bind(void 0, true));
  const clear2 = makeEventListener(window, "offline", callback.bind(void 0, false));
  return () => {
    clear1();
    clear2();
  };
}

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * @return Returns a signal representing the online status. Read-only.
 * @example
 * const isOnline = createConnectivitySignal()
 * isOnline() // T: boolean
 */
export function createConnectivitySignal(): Accessor<boolean> {
  if (process.env.SSR) {
    return trueFn;
  }
  const [status, setStatus] = createHydratableSignal<boolean>(true, () => navigator.onLine);
  makeConnectivityListener(setStatus);
  return status;
}

/**
 * A signal representing the browser's interpretation of whether it is on- or offline.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) except if during hydration.
 *
 * @return Returns a signal representing the online status. Read-only.
 * @example
 * const isOnline = useConnectivitySignal()
 * isOnline() // T: boolean
 */
export const useConnectivitySignal: () => Accessor<boolean> =
  /*#__PURE__*/ createHydratableSingletonRoot(createConnectivitySignal);
