
/**
 * Creates a simple tween method.
 *
 * @param function Target to be modified
 * @param object Object representing the ease and duration
 * @returns Returns the tweening value
 *
 * @example
 * ```ts
 * const tweenedValue = createTween(myNumber, { duration: 500 });
 * ```
 */
export default function createTween<T extends number>(
  _target: () => T,
  {}
) {
  return () => {
    /*noop*/
  };
}
