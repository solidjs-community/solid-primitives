import { createSignal, getOwner, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * Creates a very simple and straightforward media query monitor.
 *
 * @param callback Media query to listen for
 * @param boolean Sets the initial state to begin with
 * @param boolean If true watches changes and reports state reactively
 * @returns Boolean value if media query is met or not
 *
 * @example
 * ```ts
 * const isSmall = createMediaQuery("(max-width: 767px)");
 * console.log(isSmall());
 * ```
 */
const createMediaQuery = (
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

export default createMediaQuery;
