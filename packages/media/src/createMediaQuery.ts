import { getOwner, onCleanup, createSignal } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * Creates a very simple and straightforward media query monitor.
 *
 * @param query Media query to listen for
 * @param fallbackState Sets the initial state to begin with
 * @param watchChange If true watches changes and reports state reactively
 * @returns Boolean value if media query is met or not
 *
 * @example
 * ```ts
 * const isSmall = createMediaQuery("(max-width: 767px)");
 * console.log(isSmall());
 * ```
 */
 export const createMediaQuery = (
  query: string,
  fallbackState: boolean = false,
  watchChange: boolean = true
): (() => boolean) => {
  let initialState = fallbackState;
  if (!isServer) {
    const mql = window.matchMedia(query);
    initialState = mql.matches;
    if (watchChange) {
      const onChange = () => setState(mql.matches);
      mql.addEventListener("change", onChange);
      if (getOwner()) {
        onCleanup(() => mql.removeEventListener("change", onChange));
      }
    }
  }
  const [state, setState] = createSignal(initialState);
  return state;
};
