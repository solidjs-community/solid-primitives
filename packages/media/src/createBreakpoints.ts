import { createEffect, createMemo, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import { entries, getEmptyMatchesFromBreakpoints, checkMqSupported } from "./common";
import { Breakpoints, BreakpointOptions, MqlInstances, Matches } from "./types";

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
    const mqlInstances = {} as MqlInstances<T>;

    if (isMqSupported) {
      entries(breakpoints).forEach(([token, width]) => {
        const responsiveProperty = options.responsiveMode === "desktop-first" ? "max" : "min";
        const mediaquery = `(${responsiveProperty}-width: ${width})`;
        const instance = window.matchMedia(mediaquery);

        mqlInstances[token] = instance;
      });
    }

    return mqlInstances;
  });

  function getInitialMatches(): Matches<T> {
    if (!isMqSupported) {
      return options.fallbackMatch || getEmptyMatchesFromBreakpoints(breakpoints);
    }

    const matches = {} as Record<keyof T, boolean>;

    entries(mqlInstances()).forEach(([token, mql]) => {
      matches[token] = mql.matches;
    });

    return matches;
  }

  // TODO: switch to createStaticStore once available to clear types
  const [matches, setMatches] = createStore<Record<keyof T, boolean>>(
    getInitialMatches()
  ) as unknown as [Matches<T>, (token: keyof T, match: boolean) => void];

  createEffect(() => {
    const shouldWatch = options.watchChange ?? true;
    if (!shouldWatch || !isMqSupported) {
      return;
    }

    entries(mqlInstances()).forEach(([token, mql]) => {
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
