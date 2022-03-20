import { createEffect, createMemo, createSignal, getOwner, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";
import { Breakpoints, BreakpointOptions, MqlInstances, Matches } from "./types";

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

function checkMqSupported() {
  if (isServer) {
    return false;
  }

  if (!window.matchMedia) {
    return false;
  }

  return true;
}

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
  const isMqSupported = checkMqSupported();

  const mqlInstances = createMemo(() => {
    const mqlInstances: MqlInstances<T> = {};

    if (isMqSupported) {
      Object.entries(breakpoints).forEach(([token, width]) => {
        const responsiveProperty = options.responsiveMode === "desktop-first" ? "max" : "min";
        const mediaquery = `(${responsiveProperty}-width: ${width})`;
        const instance = window.matchMedia(mediaquery);

        mqlInstances[token] = instance;
      });
    }

    return mqlInstances;
  });

  function getInitialMatches() {
    if (!isMqSupported) {
      return options.fallbackMatch || {};
    }

    const matches: Matches<T> = {};

    Object.entries(mqlInstances()).forEach(([token, mql]) => {
      matches[token] = mql.matches;
    });

    return matches;
  }

  const [matches, setMatches] = createStore(getInitialMatches());

  createEffect(() => {
    const shouldWatch = options.watchChange ?? true;
    if (!shouldWatch || !isMqSupported) {
      return;
    }

    Object.entries(mqlInstances()).forEach(([token, mql]) => {
      const listener = (event: MediaQueryListEvent) => {
        setMatches(token, event.matches);
      };
      mql.addEventListener("change", listener);

      onCleanup(() => {
        mql.removeEventListener("change", listener);
      });
    });
  });

  return matches;
}

export default createMediaQuery;
