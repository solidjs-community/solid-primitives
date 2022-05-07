import { Accessor, onCleanup, createSignal, onMount, onCleanup, createEffect } from "solid-js";

export type ClipboardSetter = (data: string | ClipboardItem[]) => Promise<void>;
export type NewClipboardItem = (data: ClipboardItemData, type: string) => ClipboardItem;
export type CopyToClipboardOptions = {
  value?: any;
  setter?: ClipboardSetter;
  highlight?: boolean;
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      copyToClipboard: CopyToClipboardOptions | true;
    }
  }
}

/**
 * Generates a simple clipbaord for reading and writing.
 *
 * @return write - A method to write to the clipboard
 * @return read - Read from the clipboard
 * @return helpers - helper functions:
 * - `newItem` — Returns an item to write to the clipboard.
 *
 * @example
 * ```ts
 * const [ write, read ] = makeClipboard();
 * console.log(await read());
 * ```
 */
export const makeClipboard = (): [
  write: ClipboardSetter,
  read: () => Promise<string>,
  helpers: { newItem: NewClipboardItem }
] => {
  const read = () => navigator.clipboard.readText();
  const write: ClipboardSetter = data =>
    typeof data === "string"
      ? navigator.clipboard.writeText(data)
      : navigator.clipboard.write(data);
  const newItem: NewClipboardItem = (data, type) => new ClipboardItem({ [type]: data });
  return [write, read, { newItem }];
};

/**
 * Creates a new reactive primitive for managing the clipboard.
 *
 * @return write - A method to write to the clipboard
 * @return read - Read from the clipboard
 * @return helpers - helper functions:
 * - `newItem` — Returns an item to write to the clipboard.
 *
 * @example
 * ```ts
 * const [ write, read ] = createClipboard();
 * console.log(await read());
 * ```
 */
export const createClipboard = (data: Accessor<string | ClipboardItem[]>): Accessor<string> => {
  const [write, read] = makeClipboard();
  const [clipboard, setClipboard] = createSignal("");
  const listener = async () => setClipboard(await read());
  onMount(() => window.addEventListener("clipboardchange", listener));
  onCleanup(() => window.removeEventListener("clipboardchange", listener));
  createEffect(() => write(data()));
  listener();
  return clipboard;
};

/**
 * A helpful directive that makes it easy to copy data to clipboard directly.
 * Using it on input should capture it's value, on an HTMLElement will use innerHTML.
 *
 * @param el - Element to bind to
 * @param options - Options to supply the directive with:
 * - `value` — Value to override the clipboard with.
 * - `write` — Optional write method to use for the clipboard action.
 * - `highlight` — On copy should the text be highlighted, defaults to true.
 *
 * @example
 * ```ts
 * <input type="text" use:copyToClipboard />
 * ```
 */
export const copyToClipboard = (el: Element, options: () => CopyToClipboardOptions | true) => {
  function highlightText(node: Element, start: number, end: number) {
    const text = node.childNodes[0];
    const range = new Range();
    const selection = document.getSelection();
    range.setStart(text, start);
    range.setEnd(text, end);
    selection!.removeAllRanges();
    selection!.addRange(range);
  }
  const setValue = () => {
    const config: CopyToClipboardOptions = typeof options === "object" ? options : {};
    let data = config.value;
    if (!data) {
      // @ts-ignore
      data = el[["input", "texfield"].includes(el.tagName.toLowerCase()) ? "value" : "innerHTML"];
    }
    let write;
    if (config.setter) {
      write = config.setter;
    } else {
      [write] = makeClipboard();
    }
    if (config.highlight !== false) highlightText(el, 0, data.length);
    write!(data);
  };
  el.addEventListener("click", setValue);
  onCleanup(() => el.removeEventListener("click", setValue));
};
