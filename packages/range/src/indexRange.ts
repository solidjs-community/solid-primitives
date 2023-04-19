import {
  Accessor,
  createRoot,
  createSignal,
  onCleanup,
  Setter,
  untrack,
  DEV,
  JSX,
  createMemo,
} from "solid-js";
import { isServer } from "solid-js/web";
import { abs, ceil, min, RangeProps, sign, toFunction, accessor } from "./common";

/**
 * Reactively maps a number range of specified `stop`, `to` and `step`, with a callback function - underlying helper for the `<IndexRange>` control flow.
 * @param getStart number accessor of the start of the range
 * @param getTo number accessor of the end of the range *(not included in the range)*
 * @param getStep number accessor of the difference between two points in the range *(negative step value depends on the `to` being greater/smaller than `start`, not this argument)*
 * @param mapFn reactive function used to create mapped output item array, number value is available as a signal.
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#indexRange
 * @example
 * ```tsx
 * const [to, setTo] = createSignal(5)
 * const mapped = indexRange(() => 0, to, () => 0.5, number => {
 *    const [value, setValue] = createSignal(number());
 *    createEffect(() => handleNewNumber(number()))
 *    return value
 * })
 * mapped() // => [0, 0.5, 1, 1.5, 2...]
 * setTo(3) // changes the output array, mapping only added indexes
 * ```
 */
export function indexRange<T>(
  getStart: Accessor<number>,
  getTo: Accessor<number>,
  getStep: Accessor<number>,
  mapFn: (n: Accessor<number>) => T,
  options: { fallback?: Accessor<T> } = {},
): Accessor<T[]> {
  let disposers: VoidFunction[] = [],
    items: T[] = [],
    setters: Setter<number>[] = [],
    fallback = false;

  onCleanup(() => disposers.forEach(f => f()));

  const mapper = (i: number, n: number): void =>
    createRoot(dispose => {
      const [number, setNumber] = createSignal(n);
      disposers[i] = dispose;
      items[i] = mapFn(number);
      setters[i] = setNumber;
    });

  const mapNewRange = (start: number, to: number, step: number): T[] => {
    const newLength = abs(ceil((to - start) / step));

    // new range is empty
    if (newLength === 0) {
      disposers.forEach(f => f());

      if (options.fallback) {
        fallback = true;
        return createRoot(dispose => {
          disposers = [dispose];
          return (items = [options.fallback!()]);
        });
      }

      disposers = [];
      setters = [];
      return (items = []);
    }

    let n = start,
      i = 0;

    if (fallback) {
      fallback = false;
      disposers[0]!();
      items = [];
    }

    const oldLength = items.length;

    // previous range was empty
    if (!oldLength) {
      for (; i < newLength; i++, n += step) mapper(i, n);
      return items;
    }

    const bodyEnd: number = min(newLength, oldLength);

    // update numbers:
    for (; i < bodyEnd; i++, n += step) setters[i]!(n);

    // add at the back:
    for (; i < newLength; i++, n += step) mapper(i, n);

    // remove from the back:
    if (newLength < oldLength) {
      items.splice(i);
      setters.splice(i);
      disposers.splice(i).forEach(f => f());
    }

    return items;
  };

  return () => {
    let _step = getStep();
    if (_step === 0) {
      // eslint-disable-next-line no-console
      if (!isServer && DEV) console.warn("Range cannot have a step of 0");
      return items;
    }
    const _start = getStart();
    const _to = getTo();
    _step = abs(_step) * sign(_to - _start || 1);
    return untrack(mapNewRange.bind(void 0, _start, _to, _step));
  };
}

/**
 * Creates a list of elements by mapping a number range of specified `start`, `to`, and `step`.
 * @param start beginning of the number range *(defaults to 0)*
 * @param to end *(not included)* of the number range
 * @param step difference between two points in the range *(negative step value depends on the `to` being greater/smaller then `start`, not this argument)* *(defaults to 1)*
 * @param fallback element returned when the range size is 0
 * @param children render function, recives number value as a signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#IndexRange
 * @example
 * ```tsx
 * <IndexRange start={2} to={14} step={0.5}>
 *    {n => <div>{n()}</div>}
 * </IndexRange>
 * ```
 */
export function IndexRange<T>(
  props: RangeProps & {
    fallback?: T;
    children: ((number: Accessor<number>) => T) | T;
  },
): JSX.Element {
  let start: Accessor<number>, to: Accessor<number>, step: Accessor<number>;
  if ("to" in props) {
    start = () => props.start ?? 0;
    to = () => props.to;
    step = () => props.step ?? 1;
  } else {
    start = accessor(() => props[0]);
    to = accessor(() => props[1]);
    step = accessor(() => props[2] ?? 1);
  }
  return createMemo(
    indexRange(
      start,
      to,
      step,
      toFunction(() => props.children),
      "fallback" in props ? { fallback: () => props.fallback } : undefined,
    ),
  ) as unknown as JSX.Element;
}
