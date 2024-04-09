import { Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import { makeEventListener } from "@solid-primitives/event-listener";
import { entries, noop, createHydratableSignal } from "@solid-primitives/utils";
import { createHydratableStaticStore } from "@solid-primitives/static-store";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";

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
  callback: (e: MediaQueryListEvent) => void,
): VoidFunction {
  if (isServer) {
    return noop;
  }
  const mql = typeof query === "string" ? window.matchMedia(query) : query;
  return makeEventListener(mql, "change", callback);
}

/**
 * Creates a very simple and straightforward media query monitor.
 *
 * @param query Media query to listen for
 * @param fallbackState Server fallback state *(Defaults to `false`)*
 * @returns Boolean value if media query is met or not
 *
 * @example
 * ```ts
 * const isSmall = createMediaQuery("(max-width: 767px)");
 * console.log(isSmall());
 * ```
 */
export function createMediaQuery(query: string, serverFallback = false) {
  if (isServer) {
    return () => serverFallback;
  }
  const mql = window.matchMedia(query);
  const [state, setState] = createHydratableSignal(serverFallback, () => mql.matches);
  const update = () => setState(mql.matches);
  makeEventListener(mql, "change", update);
  return state;
}

/**
 * Provides a signal indicating if the user has requested dark color theme. The setting is being watched with a [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).
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
export function createPrefersDark(serverFallback?: boolean) {
  return createMediaQuery("(prefers-color-scheme: dark)", serverFallback);
}

/**
 * Provides a signal indicating if the user has requested dark color theme. The setting is being watched with a [Media Query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) except if during hydration.
 *
 * @returns a boolean signal
 * @example
 * const prefersDark = usePrefersDark();
 * createEffect(() => {
 *    prefersDark() // => boolean
 * });
 */
export const usePrefersDark: () => Accessor<boolean> = /*#__PURE__*/ createHydratableSingletonRoot(
  createPrefersDark.bind(void 0, false),
);

export type Breakpoints = Record<string, string>;

export type Matches<T extends Breakpoints> = {
  readonly [K in keyof T]: K extends "key" ? never : boolean;
} & { key: keyof T };

export interface BreakpointOptions<T extends Breakpoints> {
  /** If true watches changes and reports state reactively */
  watchChange?: boolean;
  /** Default value of `match` when `window.matchMedia` is not available like during SSR & legacy browsers */
  fallbackState?: Matches<T>;
  /** Use `min-width` media query for mobile first or `max-width` for desktop first. Defaults to `min-width`  */
  mediaFeature?: string;
}

const getEmptyMatchesFromBreakpoints = <T extends Breakpoints>(breakpoints: T): Matches<T> =>
  entries(breakpoints).reduce<Record<keyof T, boolean>>(
    (matches, [key]: [key: keyof T, value: string]) => {
      matches[key] = false;
      return matches;
    },
    {} as Record<keyof T, boolean>,
  ) as Matches<T>;

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
  options: BreakpointOptions<T> = {},
): Matches<T> {
  const fallback = Object.defineProperty(
    options.fallbackState ?? getEmptyMatchesFromBreakpoints(breakpoints),
    "key",
    { enumerable: false, get: () => Object.keys(breakpoints).pop() },
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (isServer || !window.matchMedia) return fallback;

  const { mediaFeature = "min-width", watchChange = true } = options;

  const [matches, setMatches] = createHydratableStaticStore<Matches<T>>(fallback, () => {
    const matches = {} as Record<keyof T, boolean>;

    entries(breakpoints).forEach(([token, width]: [t: keyof T, w: string]) => {
      const mql = window.matchMedia(`(${mediaFeature}: ${width})`);
      matches[token] = mql.matches;
      if (watchChange)
        makeEventListener(mql, "change", (e: MediaQueryListEvent) =>
          setMatches(token, e.matches as any),
        );
    });

    return matches as Matches<T>;
  });

  return Object.defineProperty(matches, "key", {
    enumerable: false,
    get: () => Object.keys(matches).findLast(token => matches[token]) as keyof T,
  });
}

/**
 * Creates a sorted copy of the Breakpoints Object
 * If you want to use the result of `createBreakpoints()` with string coercion:
 * ```ts
 * createBreakpoints(sortBreakpoints({ tablet: "980px", mobile: "640px" }))
 * ```
 */
export function sortBreakpoints(breakpoints: Breakpoints): Breakpoints {
  const sorted = entries(breakpoints);
  sorted.sort((x, y) => parseInt(x[1], 10) - parseInt(y[1], 10));
  return sorted.reduce<Breakpoints>((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
}
