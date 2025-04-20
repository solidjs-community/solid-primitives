import { Accessor, JSX, createMemo, createRoot, onCleanup } from "solid-js";
import { toFunction } from "./common.js";

/**
 * Reactively maps a number range of specified length with a callback function - underlying helper for the `<Repeat>` control flow.
 * @param times number of the elements to map
 * @param mapFn reactive function used to create mapped output item array
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#repeat
 * @example
 * ```tsx
 * const [length, setLength] = createSignal(10)
 * const mapped = repeat(length, index => {
 *    const [value, setValue] = createSignal(index);
 *    createEffect(() => {...})
 *    return value
 * })
 * ```
 */
export function repeat<T>(
  times: Accessor<number>,
  mapFn: (i: number) => T,
  options: { fallback?: Accessor<T> } = {},
): Accessor<T[]> {
  let prev: readonly T[] = [];
  let prevLen = 0;
  const disposers: (() => void)[] = [];
  onCleanup(() => {
    for (let index = 0; index < disposers.length; index++) {
      disposers[index]!();
    }
  });

  // Truncate toward zero and force positive
  const memoLen = createMemo(() => Math.max(times() | 0, 0));

  return function mapLength(): T[] {
    const len = memoLen();
    if (len === prevLen) return prev as T[];

    // Dispose of fallback or unnecessarry elements
    if (prevLen === 0) disposers[0]?.();
    else {
      for (let index = len; index < disposers.length; index++) {
        disposers[index]!();
      }
    }

    // The following prefers to use `prev.slice` to
    // preserve any array element kind optimizations
    // the runtime has made.

    if (len === 0) {
      const fallback = options.fallback;
      if (fallback) {
        // Show fallback if available
        const next = prev.slice(0, 1);
        next[0] = createRoot(dispose => {
          disposers[0] = dispose;
          return fallback();
        });

        disposers.length = 1;
        prevLen = 0;
        return (prev = next);
      } else {
        // Show empty array, otherwise
        disposers.length = 0;
        prevLen = 0;
        return (prev = prev.slice(0, 0));
      }
    }

    const next = prev.slice(0, len);

    // Create new elements as needed
    for (let index = prevLen; index < len; index++) {
      next[index] = createRoot(dispose => {
        disposers[index] = dispose;
        return mapFn(index);
      });
    }

    disposers.length = len;
    prevLen = len;
    return (prev = next);
  };
}

/**
 * Creates a range of elements `of` specified size.
 * @param times number of elements
 * @param fallback element returned when `of` equals 0
 * @param children render function
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#Repeat-1
 * @example
 * ```tsx
 * <Repeat times={10}>
 *    {n => <div>{n}</div>}
 * </Repeat>
 * ```
 */
export function Repeat<T>(props: {
  times: number;
  fallback?: T;
  children: ((index: number) => T) | T;
}): JSX.Element {
  return createMemo(
    repeat(
      () => props.times,
      toFunction(() => props.children),
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}
