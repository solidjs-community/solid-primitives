import { Accessor, createRoot, createSignal, getOwner, onCleanup } from "solid-js";

const disposeAll = (list: { dispose: VoidFunction }[]) => {
  for (const item of list) item.dispose();
};

/**
 * Creates a function for marking parts of a string that match a regex. Each match will be mapped by {@link mapMatch} and returned as an array of strings and mapped values.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/marker#createMarker
 *
 * @param mapMatch A callback for mapping the matched string to a value to be added to the returned array.
 * @param options Options for the marker.
 * - `cacheLimit` The maximum number of elements to cache for reuse. Defaults to 100.
 *
 * @returns A function that takes a string input and a regex to match the input, and returns an array of strings and mapped values.
 *
 * @example
 * ```tsx
 * const highlight = createMarker((text) => <mark>{text}</mark>);
 *
 * <p>
 *   {highlight("Hello world!", /\w+/g)} // => <mark>Hello</mark> <mark>world</mark>!
 * </p>
 * ```
 */
export function createMarker<T>(
  mapMatch: (match: Accessor<string>) => T,
  options?: { cacheLimit?: number },
): (string: string, regex: RegExp) => (string | T)[] {
  const { cacheLimit = 100 } = options ?? {},
    toReuse: { el: T; set(test: string): void; dispose: VoidFunction }[] = [],
    owner = getOwner();

  onCleanup(() => {
    disposeAll(toReuse);
    toReuse.length = 0;
  });

  const limitCache = () =>
    toReuse.length > cacheLimit && disposeAll(toReuse.splice(0, toReuse.length - cacheLimit));

  return (string, regex) => {
    let match = regex.exec(string),
      lastIndex = 0,
      reuseIndex = 0;

    if (!match) return [string];

    const parts: (string | T)[] = [],
      reusableList: typeof toReuse = [];

    do {
      const matchText = match[0];
      let reusable = toReuse[reuseIndex];
      if (reusable) {
        reuseIndex++;
        reusable.set(matchText);
      } else {
        createRoot(dispose => {
          const [text, set] = createSignal(matchText);
          reusable = { el: mapMatch(text), set, dispose };
        }, owner);
      }
      parts.push(string.slice(lastIndex, match.index), reusable!.el);
      reusableList.push(reusable!);
      lastIndex = match.index + matchText.length;
    } while ((match = regex.exec(string)));

    toReuse.splice(0, reuseIndex);
    parts.push(string.slice(lastIndex));

    onCleanup(() => {
      toReuse.push.apply(toReuse, reusableList);
      setTimeout(limitCache);
    });

    return parts;
  };
}
