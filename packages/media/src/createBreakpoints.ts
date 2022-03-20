import { createEffect, createMemo, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";
import { Breakpoints, BreakpointOptions, MqlInstances, Matches } from "./types";

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
