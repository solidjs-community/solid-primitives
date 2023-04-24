import { Accessor, createRoot, createSignal, getOwner, onCleanup } from "solid-js";

const SANITIZE_REGEX = /[^\w ]/g,
  EMPTY_REGEX = /(?:)/;

/**
 * Creates a regex from a search string. This regex can be used to match any of the words in the search string.
 *
 * @param search The search string to create a regex from.
 * @returns A regex that matches any of the words in the search string.
 */
export function makeSearchRegex(search: string): RegExp {
  // sanitize search string (remove non-word characters)
  search = search.trim().replace(SANITIZE_REGEX, "");
  return search
    ? new RegExp(
        // join words `|` to match any of them
        search.replace(/\s+/g, "|"),
        "gi",
      )
    : EMPTY_REGEX;
}

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
 * - `cacheSize` The maximum number of elements to cache for reuse. Defaults to 100.
 *
 * @returns A function that takes a string input and a regex to match the input, and returns an array of strings and mapped values.
 *
 * @example
 * ```tsx
 * const highlight = createMarker((text) => <mark>{text()}</mark>);
 *
 * <p>
 *   {highlight("Hello world!", /\w+/g)} // => <mark>Hello</mark> <mark>world</mark>!
 * </p>
 * ```
 */
export function createMarker<T>(
  mapMatch: (match: Accessor<string>) => T,
  options?: { cacheSize?: number },
): (string: string, regex: RegExp) => (string | T)[] {
  const { cacheSize = 100 } = options ?? {},
    toReuse: { el: T; set(test: string): void; dispose(): void }[] = [],
    owner = getOwner(),
    limitCache = () =>
      toReuse.length > cacheSize && disposeAll(toReuse.splice(0, toReuse.length - cacheSize));

  onCleanup(() => {
    disposeAll(toReuse);
    toReuse.length = 0;
  });

  return (string, regex) => {
    let match = regex.exec(string),
      lastIndex = 0,
      reuseIndex = 0;

    // fast path for no matches and empty regex
    if (!match || !match[0]) return [string];

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
      lastIndex !== match.index && parts.push(string.slice(lastIndex, match.index));
      parts.push(reusable!.el);
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
