import { Accessor, createRoot, onCleanup, untrack } from "solid-js";
import { abs, accessor, ceil, floor, min, RangeProps, toFunction } from "./common";

/**
 * Reactively maps a number range of specified `stop`, `to` and `step`, with a callback function - underlying helper for the `<Range>` control flow.
 * @param getStart number accessor of the start of the range
 * @param getTo number accessor of the end of the range *(not included in the range)*
 * @param getStep number accessor of the difference between two points in the range *(negative step value depends on the `to` being greater/smaller than `start`, not this argument)*
 * @param mapFn reactive function used to create mapped output item array
 * @param options a fallback for when the input list is empty or missing
 * @returns mapped input array signal
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#mapRange
 * @example
 * ```tsx
 * const [to, setTo] = createSignal(5)
 * const mapped = mapRange(() => 0, to, () => 0.5, number => {
 *    const [value, setValue] = createSignal(number);
 *    createEffect(() => {...})
 *    return value
 * })
 * mapped() // => [0, 0.5, 1, 1.5, 2...]
 * setTo(3) // changes the output array, mapping only added numbers
 * ```
 */
export function mapRange<T>(
  getStart: Accessor<number>,
  getTo: Accessor<number>,
  getStep: Accessor<number>,
  mapFn: (n: number) => T,
  options: { fallback?: Accessor<T> } = {}
): Accessor<T[]> {
  let disposers: VoidFunction[] = [],
    items: T[] = [],
    prevStart = 0,
    prevTo = 0,
    prevStep = getStep(),
    fallback = false;

  onCleanup(() => disposers.forEach(f => f()));

  const mapper = (i: number, n: number, itemsList: T[], disposersList: VoidFunction[]): void =>
    createRoot(dispose => {
      disposersList[i] = dispose;
      itemsList[i] = mapFn(n);
    });

  const mapNewRange = (start: number, to: number, step: number): T[] => {
    // new range is empty
    if (start === to) {
      disposers.forEach(f => f());

      if (options.fallback) {
        fallback = true;
        return createRoot(dispose => {
          disposers = [dispose];
          return (items = [options.fallback!()]);
        });
      }

      disposers = [];
      return (items = []);
    }

    let n = start,
      i = 0;

    if (fallback) {
      fallback = false;
      disposers[0]!();
      items = [];
    }

    // previous range was empty
    if (!items.length) {
      for (; n < to; i++, n += step) mapper(i, n, items, disposers);
      return items;
    }

    const newLength = ceil((to - start) / step);
    const newItems = new Array(newLength) as T[];
    const newDisposers = new Array(newLength) as VoidFunction[];
    const oldDisposers: (VoidFunction | undefined)[] = disposers;
    let end: number;

    // front - add
    if (start < prevStart) {
      end = min(ceil((prevStart - start) / step), newLength);
      for (n = start; i < end; i++, n += step) mapper(i, n, newItems, newDisposers);
    }

    // body - keep/add
    end = ceil((min(prevTo, to) - start) / step);
    for (; i < end; n += step, i++) {
      let index = (n - prevStart) / prevStep;
      if (Number.isInteger(index) || (index < 1 && index + Number.EPSILON > 1)) {
        index = ceil(index);
        newItems[i] = items[index]!;
        newDisposers[i] = disposers[index]!;
        oldDisposers[index] = undefined;
      } else {
        mapper(i, n, newItems, newDisposers);
      }
    }

    // back - add
    if (to > prevTo) {
      for (; i < newLength; i++, n += step) mapper(i, n, newItems, newDisposers);
    }

    oldDisposers.forEach(f => f?.());
    disposers = newDisposers;
    return (items = newItems);
  };

  return () => {
    let _step = getStep();
    if (_step === 0) {
      // eslint-disable-next-line no-console
      if (process.env.DEV) console.warn("Range cannot have a step of 0");
      return items;
    }
    let _start = getStart();
    let _to = getTo();
    _step = abs(_step);
    const positive = _start <= _to;
    if (!positive) {
      const temp = _start;
      const x = (_start - _to) / _step;
      _start = _start - (Number.isInteger(x) ? x - 1 : floor(x)) * _step;
      _to = temp + _step;
    }
    const list = untrack(mapNewRange.bind(void 0, _start, _to, _step));
    prevStart = _start;
    prevTo = _to;
    prevStep = _step;
    return positive ? list : [...list].reverse();
  };
}

/**
 * Creates a list of elements by mapping a number range of specified `start`, `to`, and `step`.
 * @param start beginning of the number range *(defaults to 0)*
 * @param to end *(not included)* of the number range
 * @param step difference between two points in the range *(negative step value depends on the `to` being greater/smaller then `start`, not this argument)* *(defaults to 1)*
 * @param fallback element returned when the range size is 0
 * @param children render function, recives plain number value
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/range#Range
 * @example
 * ```tsx
 * <Range start={2} to={14} step={0.5}>
 *    {n => <div>{n}</div>}
 * </Range>
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-shadow
export function Range<T>(
  props: RangeProps & {
    fallback?: T;
    children: ((number: number) => T) | T;
  }
): Accessor<T[]> {
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
  const fallback = props.fallback ? () => props.fallback as T : undefined;
  const mapFn = toFunction(() => props.children);
  return mapRange(start, to, step, mapFn, { fallback });
}
