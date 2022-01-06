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

export default createMediaQuery;
