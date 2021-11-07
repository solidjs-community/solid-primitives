import { onCleanup } from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      copyToClipboard: {
        value?: any;
        setter: ClipboardSetter;
      };
    }
  }
}

type ClipboardSetter = (data: string | ClipboardItem[]) => Promise<void>;

/**
 * Primitives to that make reading and writing to clipboard easy.
 *
 * @return write - A method to write to the clipboard
 * @return read - Read from the clipboard
 * @return options - IntersectionObserver constructor options:
 * - `newItem` — Returns an item to write to the clipboard.
 *
 * @example
 * ```ts
 * const [ write, read ] = createClipboard();
 * console.log(await read());
 * ```
 */
const createClipboard = (): [
  write: ClipboardSetter,
  read: () => Promise<ClipboardItems | undefined>,
  helpers: {
    newItem: (data: ClipboardItemData, type: string) => ClipboardItem;
  }
] => {
  const permission = async (perm: string = "write") => {
    if (navigator.permissions && navigator.clipboard) {
      const result = await navigator.permissions.query({
        name: `clipboard-${perm}` as PermissionName
      });
      if (["granted", "prompt"].includes(result.state)) {
        return true;
      }
      throw new Error("Permission to access Clipboard not granted.");
    }
  };
  const read = async () => {
    if (!(await permission("read"))) return;
    return await navigator.clipboard.read();
  };
  const write = async (data: string | ClipboardItem[]) => {
    if (!(await permission())) return;
    // @ts-ignore
    await navigator.clipboard[typeof data === "string" ? "writeText" : "write"](data);
  };
  const newItem = (data: ClipboardItemData, type: string) => new ClipboardItem({ [type]: data });
  return [write, read, { newItem }];
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
export const copyToClipboard = (
  el: Element,
  options: () => {
    value?: any;
    setter?: ClipboardSetter;
    highlight: boolean;
  }
) => {
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
    let data = options().value;
    if (!data) {
      // @ts-ignore
      data = el[["input", "texfield"].includes(el.tagName.toLowerCase()) ? "value" : "innerHTML"];
    }
    let write;
    if (options().setter) {
      write = options().setter;
    } else {
      [write] = createClipboard();
    }
    if (options().highlight !== false) highlightText(el, 0, data.length);
    write!(data);
  };
  el.addEventListener("click", setValue);
  onCleanup(() => el.removeEventListener("click", setValue));
};

export default createClipboard;
