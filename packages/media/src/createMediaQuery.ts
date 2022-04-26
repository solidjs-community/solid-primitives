import { createSignal, Accessor } from "solid-js";
import { makeEventListener } from "@solid-primitives/event-listener";

/**
 * attaches a MediaQuery listener to window, listeneing to changes to provided query
 * @param query Media query to listen for
 * @param callback function called every time the media match changes
 * @returns function removing the listener
 * @example
 * const clear = makeMediaQueryListener("(max-width: 767px)", e => {
 *    console.log(e.matches)
 * });
 * // remove listeners (will happen also on cleanup)
 * clear()
 */
export function makeMediaQueryListener(
  query: string | MediaQueryList,
  callback: (e: MediaQueryListEvent) => void
): VoidFunction {
  const mql = typeof query === "string" ? window.matchMedia(query) : query;
  return makeEventListener(mql, "change", callback);
}

/**
 * Creates a very simple and straightforward media query monitor.
 *
 * @param query Media query to listen for
 * @param fallbackState Server fallback state
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
  fallbackState: boolean,
  watchChange = true
): Accessor<boolean> => {
  const mql = window.matchMedia(query);
  if (!watchChange) return () => mql.matches;
  const [state, setState] = createSignal(mql.matches);
  makeEventListener(mql, "change", () => setState(mql.matches));
  return state;
};
