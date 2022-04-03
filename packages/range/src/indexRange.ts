import { Fn, warn } from "@solid-primitives/utils";
import { Accessor, createRoot, createSignal, onCleanup, Setter, untrack } from "solid-js";
import { abs, accessor, ceil, min, RangeProps, sign, toFunction } from "./common";

export function indexRange<T>(
  start: Accessor<number>,
  to: Accessor<number>,
  step: Accessor<number>,
  mapFn: (n: Accessor<number>) => T,
  options: { fallback?: Accessor<T> } = {}
): Accessor<T[]> {
  let disposers: Fn[] = [],
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
      disposers[0]();
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
    for (; i < bodyEnd; i++, n += step) setters[i](n);

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
    let _step = step();
    if (_step === 0) {
      warn("Range cannot have a step of 0");
      return items;
    }
    let _start = start();
    let _to = to();
    _step = abs(_step) * sign(_to - _start || 1);
    return untrack(mapNewRange.bind(void 0, _start, _to, _step));
  };
}

export function IndexRange<T>(
  props: RangeProps & {
    fallback?: T;
    children: ((number: Accessor<number>) => T) | T;
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
  return indexRange(start, to, step, mapFn, { fallback });
}
