import { createSignal, Accessor } from "solid-js";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createStaticStore, forEachEntry } from "@solid-primitives/utils";
import { getEmptyMatchesFromBreakpoints } from "./common";
import { Breakpoints, BreakpointOptions, Matches } from "./types";
import { createSharedRoot } from "@solid-primitives/rootless";

export * from "./types";

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
 * @param fallbackState Server fallback state *(Defaults to `false`)*
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
  fallbackState?: boolean,
  watchChange = true
): Accessor<boolean> => {
  const mql = window.matchMedia(query);
  if (!watchChange) return () => mql.matches;
  const [state, setState] = createSignal(mql.matches);
  makeEventListener(mql, "change", () => setState(mql.matches));
  return state;
};

/**
 * Creates a multi-breakpoint monitor to make responsive components easily.
 * 
 * @param breakpoints Map of breakpoint names and their widths
 * @param options Options to customize watch, fallback, responsive mode.
 * @returns map of currently matching breakpoints.
 * 
 * @example
 * ```ts
 * const breakpoints = {
    sm: "640px",
    lg: "1024px",
    xl: "1280px",
  };
 * const matches = createBreakpoints(breakpoints);
 * console.log(matches.lg);
 * ```
 */
export function createBreakpoints<T extends Breakpoints>(
  breakpoints: T,
  options: BreakpointOptions<T> = {}
): Matches<T> {
  if (!window.matchMedia)
    return options.fallbackState ?? getEmptyMatchesFromBreakpoints(breakpoints);

  const { mediaFeature = "min-width", watchChange = true } = options;

  const [matches, setMatches] = createStaticStore<Matches<T>>(
    (() => {
      const matches = {} as Record<keyof T, boolean>;

      forEachEntry(breakpoints, (token, width) => {
        const mql = window.matchMedia(`(${mediaFeature}: ${width})`);
        matches[token] = mql.matches;

        if (watchChange) makeEventListener(mql, "change", e => setMatches(token, e.matches as any));
      });

      return matches;
    })()
  );

  return matches;
}
/**
 * Provides a signal indicating if the user has requested dark color theme. The setting is being watched with a [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).
 *
 * This is a [shared root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot).
 *
 * @param serverFallback value that should be returned on the server — defaults to `false`
 *
 * @returns a boolean signal
 * @example
 * const prefersDark = usePrefersDark();
 * createEffect(() => {
 *    prefersDark() // => boolean
 * });
 */
export const usePrefersDark: (serverFallback?: boolean) => Accessor<boolean> =
  /*#__PURE__*/ createSharedRoot(
    createMediaQuery.bind(null, "(prefers-color-scheme: dark)", false, true)
  );
