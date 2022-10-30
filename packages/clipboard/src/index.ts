import {
  Accessor,
  createResource,
  Resource,
  on,
  onMount,
  onCleanup,
  createEffect,
  createSignal
} from "solid-js";
import { MaybeAccessor, access } from "@solid-primitives/utils";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      copyToClipboard: CopyToClipboardOptions | true;
    }
  }
}

/**
 * Generates a simple non-reactive clipboard primitive for reading and writing.
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
  if (process.env.SSR) {
    return [async () => void 0, async () => void 0, () => ({} as ClipboardItem)];
  }
  const read = async () => await navigator.clipboard.read();
  const write: ClipboardSetter = async data => {
    typeof data === "string"
      ? await navigator.clipboard.writeText(data)
      : await navigator.clipboard.write(data);
  };
  return [write, read, newItem];
};

/**
 * Creates a new reactive primitive for managing the clipboard.
 *
 * @param data - Data signal to write to the clipboard.
 * @param deferInitial - Sets the value of the clipboard from the signal. defaults to false.
 * @return Returns a resource representing the clipboard elements and children.
 *
 * @example
 * const [data, setData] = createSignal('Foo bar');
 * const [ clipboard, read ] = createClipboard(data);
 */
export const createClipboard = (
  data?: Accessor<string | ClipboardItem[]>,
  deferInitial?: boolean
): [
  clipboardItems: Resource<
    {
      type: string;
      text: Accessor<string>;
      blob: Accessor<Blob>;
    }[]
  >,
  refetch: VoidFunction,
  write: ClipboardSetter
] => {
  if (process.env.SSR) {
    return [
      Object.assign(() => [], { loading: false, error: undefined }) as any,
      () => void 0,
      async () => void 0
    ];
  }
  const [write, readClipboard] = makeClipboard();
  const [clipboard, { refetch }] = createResource<any>(async () => {
    const items = (await readClipboard()) || [];
    return items.map(item => {
      const [data, setData] = createSignal<string | Blob | undefined>(undefined);
      const getType = () => item.types[item.types.length - 1];
      return {
        async load(mime: string) {
          const blob = await item.getType(mime);
          const nextData = blob.type === "text/plain" ? await blob.text() : blob;
          setData(() => nextData);
        },
        get type(): string {
          return getType();
        },
        get text() {
          this.load("text/plain");
          return data;
        },
        get blob() {
          this.load(getType());
          return data;
        }
      };
    });
  });
  onMount(() => navigator.clipboard.addEventListener("clipboardchange", refetch));
  onCleanup(() => navigator.clipboard.removeEventListener("clipboardchange", refetch));
  if (data) {
    createEffect(on(data, () => write(data()), { defer: deferInitial || true }));
  }
  return [clipboard, refetch, write];
};

/**
 * A helpful directive that makes it easy to copy data to clipboard directly.
 * Using it on input should capture it's value, on an HTMLElement will use innerHTML.
 *
 * @param el - Element to bind to
 * @param options - Options to supply the directive with:
 * - `value` — Value to override the clipboard with.
 * - `write` — Optional write method to use for the clipboard action.
 * - `highlight` — The highlight modifier to use for the current element.
 *
 * @example
 * ```ts
 * <input type="text" use:copyToClipboard />
 * ```
 */
export const copyToClipboard = (
  el: HTMLElement | HTMLInputElement,
  options: MaybeAccessor<CopyToClipboardOptions>
) => {
  if (process.env.SSR) {
    return undefined;
  }
  const setValue = () => {
    const opts: CopyToClipboardOptions = access(options);
    let data = opts.value;
    if (!data) {
      // @ts-ignore
      data = el[["input", "texfield"].includes(el.tagName.toLowerCase()) ? "value" : "innerHTML"];
    }
    let write;
    if (opts.setter) {
      write = opts.setter;
    } else {
      write = async (data: any) => await navigator.clipboard.writeText(data);
    }
    if (opts.highlight) opts.highlight(el);
    write!(data);
  };
  el.addEventListener("click", setValue);
  onCleanup(() => el.removeEventListener("click", setValue));
};

/**
 * newItem is a wrapper method around creating new ClipboardItems.
 *
 * @param type - The MIME type of the item to create
 * @param data - Data to populate the item with
 * @returns Provides a ClipboardItem object
 */
export const newItem: NewClipboardItem = (type, data) => new ClipboardItem({ [type]: data });

/**
 * A modifier that highlights/selects a range on an HTML element.
 *
 * @param start - Starting point to highlight
 * @param end - Ending point to highlight
 * @returns Returns a modifier function.
 */
export const element: Highlighter = (start: number = 0, end: number = 0) => {
  return (node: HTMLElement) => {
    const text = node.childNodes[0];
    const range = new Range();
    range.setStart(text, start);
    range.setEnd(text, end);
    const selection = document.getSelection();
    selection!.removeAllRanges();
    selection!.addRange(range);
  };
};

/**
 * A modifier that highlights/selects a range on an HTML input element.
 *
 * @param start - Starting point to highlight
 * @param end - Ending point to highlight
 * @returns Returns a modifier function.
 */
export const input: Highlighter = (start?: number, end?: number) => {
  return (node: HTMLInputElement) => {
    node.setSelectionRange(start || 0, end || node.value.length);
  };
};
