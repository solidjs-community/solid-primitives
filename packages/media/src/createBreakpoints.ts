import { makeEventListener } from "@solid-primitives/event-listener";
import { createStaticStore, forEachEntry } from "@solid-primitives/utils";
import { getEmptyMatchesFromBreakpoints } from "./common";
import { Breakpoints, BreakpointOptions, Matches } from "./types";

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
