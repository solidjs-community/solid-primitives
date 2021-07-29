import { createSignal, onMount, onCleanup } from "solid-js";

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
  initialState: boolean = false,
  watchChange: boolean = true
): (() => boolean) => {
  let mql: MediaQueryList;
  const [state, setState] = createSignal(initialState);
  const onChange = () => setState(mql.matches);
  onMount(() => {
    mql = window.matchMedia(query);
    if (watchChange) {
      mql.addEventListener("change", onChange);
    }
    setState(mql.matches);
  });
  onCleanup(() => watchChange && mql.removeEventListener("change", onChange));
  return state;
};

export default createMediaQuery;
