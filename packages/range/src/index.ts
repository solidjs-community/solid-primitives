import { Accessor, createMemo, createRoot, onCleanup, untrack } from "solid-js";

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

  const memoLen = createMemo(length);
  return () => untrack(mapNewRange.bind(void 0, memoLen()));
}
