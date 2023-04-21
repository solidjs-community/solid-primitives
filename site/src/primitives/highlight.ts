import { Accessor, createRoot, createSignal, getOwner, onCleanup } from "solid-js";

const disposeAll = (list: { dispose: VoidFunction }[]) => {
  for (const item of list) item.dispose();
};

export function createHighlight<T>(
  mapElement: (text: Accessor<string>) => T,
  cacheLimit = 100,
): (inputText: string, query: string) => (string | T)[] {
  type Reusable = { el: T; set(test: string): void; dispose: VoidFunction };

  const toReuse: Reusable[] = [],
    owner = getOwner();

  onCleanup(() => {
    disposeAll(toReuse);
    toReuse.length = 0;
  });

  const limitCache = () =>
    toReuse.length > cacheLimit && disposeAll(toReuse.splice(0, toReuse.length - cacheLimit));

  return (inputText, query) => {
    if (!query) return [inputText];

    const regex = new RegExp(query, "gi"),
      parts: (string | T)[] = [],
      reusableList: Reusable[] = [];

    let match: RegExpExecArray | null,
      lastIndex = 0,
      reuseIndex = 0;

    while ((match = regex.exec(inputText))) {
      parts.push(inputText.slice(lastIndex, match.index));
      const matchText = match[0];
      let reusable = toReuse[reuseIndex];
      if (reusable) {
        reuseIndex++;
        reusable.set(matchText);
      } else {
        createRoot(dispose => {
          const [text, set] = createSignal(matchText);
          reusable = { el: mapElement(text), set, dispose };
        }, owner);
      }
      parts.push(reusable!.el);
      reusableList.push(reusable!);
      lastIndex = match.index + matchText.length;
    }

    toReuse.splice(0, reuseIndex);

    onCleanup(() => {
      toReuse.push.apply(toReuse, reusableList);
      setTimeout(limitCache);
    });

    parts.push(inputText.slice(lastIndex));

    return parts;
  };
}
