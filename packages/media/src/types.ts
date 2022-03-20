export type Breakpoints = Record<string, string>;

export type Matches = Record<string, Boolean>;

export interface BreakpointOptions {
  /** If true watches changes and reports state reactively */
  watchChange?: boolean;
  /** Default value of `match` when `window.matchMedia` is not available like during SSR & legacy browsers */
  fallbackMatch?: Matches;
  /** Use `min-width` media query for mobile first or `max-width` for desktop first  */
  responsiveMode?: "mobile-first" | "desktop-first";
}

export type MqlInstances = Record<string, MediaQueryList>;
