import { Accessor, createMemo, createRoot, onCleanup, untrack } from "solid-js";

/**
 * Reactively maps a number range of specified length with a callback function - underlying helper for the `<Range>` control flow.
 * @param length number of the elements to map
 * @param mapFn reactive function used to create mapped output item array
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#mapRange
 * @example
 * ```tsx
 * const [length, setLength] = createSignal(10)
 * const mapped = mapRange(length, index => {
 *    const [value, setValue] = createSignal(index);
 *    createEffect(() => {...})
 *    return value
 * })
 * ```
 */
export function mapRange<T>(
  length: Accessor<number>,
  mapFn: (i: number) => T,
  options: { fallback?: Accessor<T> } = {}
): Accessor<T[]> {
  let disposers: (() => void)[] = [],
    items: T[] = [];

  onCleanup(() => disposers.forEach(f => f()));

  const mapNewRange = (len: number): T[] => {
    if (len === 0) {
      disposers.forEach(f => f());

      if (options.fallback)
        return [
          createRoot(dispose => {
            disposers[0] = dispose;
            return options.fallback!();
          })
        ];

      disposers = [];
      return (items = []);
    }

    const prevLen = items.length;

    if (prevLen === 0) {
      // after fallback case:
      if (disposers[0]) disposers[0]();

      for (let i = 0; i < len; i++) items[i] = createRoot(mapper.bind(void 0, i));
      return items;
    }

    {
      const diff = prevLen - len;
      if (diff > 0) {
        for (let i = prevLen - 1; i >= len; i--) disposers[i]();
        items.splice(len, diff);
        disposers.splice(len, diff);
        return items;
      }
    }

    for (let i = prevLen; i < len; i++) items[i] = createRoot(mapper.bind(void 0, i));
    return items;
  };

  const mapper = (index: number, dispose: () => void): T => {
    disposers[index] = dispose;
    return mapFn(index);
  };

  const memoLen = createMemo(() => Math.floor(Math.max(length(), 0)));
  return () => untrack(mapNewRange.bind(void 0, memoLen()));
}

/**
 * Creates a range of elements `of` specified size.
 * @param of number of elements
 * @param fallback element returned when `of` equals 0
 * @param children render function
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#Range
 * @example
 * ```tsx
 * <Range of={10}>
 *    {n => <div>{n}</div>}
 * </Range>
 * ```
 */
export function Range<T>(props: {
  of: number;
  fallback?: T;
  children: (index: number) => T;
}): Accessor<T[]> {
  const fallback = props.fallback ? () => props.fallback as T : undefined;
  const length = () => props.of;
  return mapRange(length, props.children, { fallback });
}
