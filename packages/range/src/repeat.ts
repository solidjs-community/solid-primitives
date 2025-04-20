import { Accessor, JSX, createMemo, createRoot, onCleanup, untrack } from "solid-js";
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
  let disposers: (() => void)[] = [],
    items: T[] = [],
    prevLen = 0;

  onCleanup(() => disposers.forEach(f => f()));

  const mapLength = (len: number): T[] => {
    if (len === 0) {
      disposers.forEach(f => f());

      if (options.fallback)
        return createRoot(dispose => {
          disposers = [dispose];
          return (items = [options.fallback!()]);
        });

      disposers = [];
      return (items = []);
    }

    if (prevLen === 0) {
      // after fallback case:
      if (disposers[0]) disposers[0]();
      for (let i = 0; i < len; i++) items[i] = createRoot(mapper.bind(void 0, i));
      return items;
    }

    {
      const diff = prevLen - len;
      if (diff > 0) {
        for (let i = prevLen - 1; i >= len; i--) disposers[i]!();
        items = items.slice(0, len);
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

  const memoLen = createMemo(() => Math.floor(Math.max(times(), 0)));
  return () => {
    const len = memoLen();
    return untrack(() => {
      const newItems = mapLength(len);
      prevLen = len;
      return newItems;
    });
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
