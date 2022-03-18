import { createEffect, createMemo, createSignal, getOwner, onCleanup } from "solid-js";
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

type Breakpoints = Record<string, string>;
type MqlInstances = Record<string, MediaQueryList>;
type Matches = Record<string, Boolean>;

/**
 * Creates a multi-breakpoint monitor to make responsive components easily.
 * 
 * @param breakpoints Map of breakpoint names and their widths
 * @param boolean If true watches changes and reports state reactively
 * 
 * @example
 * ```ts
 * const breakpoints = {
    sm: "640px",
    lg: "1024px",
    xl: "1280px",
  } as const;
 * const { minMatch, matches } = createResponsive(breakpoints);
 * console.log(minMatch('lg'), matches());
 * ```
 */
export const createResponsive = (breakpoints: Breakpoints, watchChange: boolean = true) => {
  const mqlInstances = createMemo(() => {
    const mqlInstances: MqlInstances = {};

    Object.entries(breakpoints).forEach(([token, width]) => {
      const mediaquery = `(min-width: ${width})`;
      const instance = window.matchMedia(mediaquery);

      mqlInstances[token] = instance;
    });

    return mqlInstances;
  });

  function getInitialMatches() {
    const matches: Matches = {};

    Object.entries(mqlInstances()).forEach(([token, mql]) => {
      matches[token] = mql.matches;
    });

    return matches;
  }

  const [matches, setMatches] = createSignal(getInitialMatches());

  function minMatch(token: string) {
    const isMatching = matches()[token];

    return Boolean(isMatching);
  }

  createEffect(() => {
    if (!watchChange) {
      return;
    }

    Object.entries(mqlInstances()).forEach(([token, mql]) => {
      const listener = (event: MediaQueryListEvent) => {
        setMatches(prev => {
          return {
            ...prev,
            [token]: event.matches
          };
        });
      };
      mql.addEventListener("change", listener);

      onCleanup(() => {
        mql.removeEventListener("change", listener);
      });
    });
  });

  return {
    /** returns `true` if screen is matching given breakpoint or higher */
    minMatch,
    /** accessor for map of currently matching breakpoints. */
    matches
  };
};

export default createMediaQuery;
