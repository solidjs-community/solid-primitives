import { Breakpoints, BreakpointOptions } from "./types";

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
  _query: string,
  _initialState: boolean = false,
  _watchChange: boolean = true
): (() => boolean) => {
  return () => false;
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
  } as const;
 * const matches = createBreakpoints(breakpoints);
 * console.log(matches.lg);
 * ```
 */
export const createBreakpoints = (_breakpoints: Breakpoints, options: BreakpointOptions = {}) => {
  return options.fallbackMatch || {};
};

export default createMediaQuery;
