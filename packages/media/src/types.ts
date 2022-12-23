export type Breakpoints = Record<string, string>;

export type Matches<T extends Breakpoints> = {
  readonly [K in keyof T]: boolean;
};

export interface BreakpointOptions<T extends Breakpoints> {
  /** If true watches changes and reports state reactively */
  watchChange?: boolean;
  /** Default value of `match` when `window.matchMedia` is not available like during SSR & legacy browsers */
  fallbackState?: Matches<T>;
  /** Use `min-width` media query for mobile first or `max-width` for desktop first. Defaults to `min-width`  */
  mediaFeature?: string;
}
