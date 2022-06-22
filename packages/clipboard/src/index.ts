import { Accessor, createResource, Resource, on, onMount, onCleanup, createEffect, createSignal } from "solid-js";

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


export const newItem: NewClipboardItem = (data, type) => new ClipboardItem({ [type]: data });

/**
 * Generates a simple non-reactive clipbaord primitive for reading and writing.
 *
 * @return write - Async write to the clipboard
 * @return read - Async read from the clipboard
 * @return newItem - Helper function to wrap ClipboardItem creation.
 *
 * @example
 * ```ts
 * const [ write, read ] = makeClipboard();
 * console.log(await read());
 * ```
 */
export const makeClipboard = (): [
  write: ClipboardSetter,
  read: () => Promise<ClipboardItems | undefined>,
  newItem: NewClipboardItem
] => {
  const read = async () => await navigator.clipboard.read();
  const write: ClipboardSetter = async data =>
    typeof data === "string"
      ? await navigator.clipboard.writeText(data)
      : await navigator.clipboard.write(data);
  return [write, read, newItem];
};

/**
 * Creates a new reactive primitive for managing the clipboard.
 *
 * @param data - Data signal to write to the clipboard.
 * @return Returns a signal representing the body of the clipboard value.
 *
 * @example
 * ```ts
 * const [ write, read ] = createClipboard();
 * console.log(await read());
 * ```
 */
export const createClipboard = (data: Accessor<string | ClipboardItem[]>): [
  clipboardItems: Resource<{
    type: string;
    text: () => string;
    blob: () => Blob;
  }[]>,
  refetch: VoidFunction
 ] => {
  const [write, readClipboard] = makeClipboard();
  const [clipboard, { refetch }] = createResource<any>(
    async () => {
      const items = await (readClipboard()) || [];
      return items.map((item) => {
        const [data, setData] = createSignal<string | Blob | undefined>(undefined);
        const getType = () => item.types[item.types.length - 1];
        return {
          async load(mime: string) {
            const value = await item.getType(mime);
            setData(value.type == 'text/plain' ? await value.text() : value);
          },
          get type(): string {
            return getType();
          },
          get text(): Accessor<string | Blob | undefined> {
            this.load('text/plain');
            return data;
          },
          get blob(): Accessor<string | Blob | undefined> {
            this.load(getType());
            return data;
          }
        }
      });
    }
  );
  onMount(() => navigator.clipboard.addEventListener("clipboardchange", refetch));
  onCleanup(() => navigator.clipboard.removeEventListener("clipboardchange", refetch));
  createEffect(on(data, () => write(data()), { defer: true }));
  return [clipboard, refetch];
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
