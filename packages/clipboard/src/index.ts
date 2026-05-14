import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";

import { isServer } from "@solidjs/web";

export type ClipboardSetter = (data: string | ClipboardItem[]) => Promise<void>;
export type NewClipboardItem = (
  type: string,
  data: string | Blob | PromiseLike<string | Blob>,
) => ClipboardItem;
export type HighlightModifier = (el: any) => void;
export type Highlighter = (start?: number, end?: number) => HighlightModifier;
export type CopyToClipboardOptions = {
  value?: any;
  setter?: ClipboardSetter;
  highlight?: HighlightModifier;
};

export type ClipboardResourceItem = {
  readonly type: string;
  readonly text: string | undefined;
  readonly blob: Blob;
};

/**
 * Async write to the clipboard
 * @param data - Data to write to the clipboard - either a string or ClipboardItem array.
 */
export const writeClipboard: ClipboardSetter = async data => {
  if (isServer) return;
  typeof data === "string"
    ? await navigator.clipboard.writeText(data)
    : await navigator.clipboard.write(data);
};

/**
 * Async read from the clipboard
 * @return Promise of ClipboardItem array
 */
export function readClipboard(): Promise<ClipboardItem[]> {
  if (isServer) return Promise.resolve([]);
  return navigator.clipboard.read();
}

/**
 * @deprecated Use `readClipboard`, `writeClipboard` and `newClipboardItem` instead.
 */
export const makeClipboard = (): [
  writeClipboard: ClipboardSetter,
  readClipboard: () => Promise<ClipboardItems | undefined>,
  newClipboardItem: NewClipboardItem,
] => {
  return [writeClipboard, readClipboard, newClipboardItem];
};

async function readClipboardItems(): Promise<ClipboardResourceItem[]> {
  try {
    const items = await readClipboard();
    if (!items.length) return [];
    return Promise.all(
      items.map(async item => {
        const type = item.types[item.types.length - 1]!;
        const blob = await item.getType(type);
        const text = blob.type === "text/plain" ? await blob.text() : undefined;
        return { type, blob, text };
      }),
    );
  } catch {
    return [];
  }
}

/**
 * Creates a reactive primitive for managing the clipboard.
 *
 * Returns an async `Accessor<ClipboardResourceItem[]>` backed by a Solid 2.0
 * async memo. The accessor starts with an empty array synchronously (no initial
 * suspension). After calling `refetch()`, it reads from the clipboard
 * asynchronously. During a pending read, the previous value remains visible
 * and `isPending(() => clipboard())` returns true.
 *
 * Wrap usage in a `<Loading>` boundary only if you need a fallback for the
 * initial page load (the accessor never suspends before the first refetch).
 *
 * @param data - Optional signal; when provided its value is written to the
 *   clipboard reactively on every change after the first (deferred by default).
 * @param deferInitial - When false, also writes the initial signal value on
 *   mount. Defaults to true (skip first write).
 *
 * @example
 * ```tsx
 * const [data, setData] = createSignal("Hello");
 * const [clipboard, refetch] = createClipboard(data);
 *
 * setData("World"); // writes "World" to clipboard
 * refetch();        // reads current clipboard into clipboard()
 *
 * return (
 *   <For each={clipboard()}>
 *     {item => <Match when={item.type === "text/plain"}>{item.text}</Match>}
 *   </For>
 * );
 * ```
 */
export const createClipboard = (
  data?: Accessor<string | ClipboardItem[]>,
  deferInitial?: boolean,
): [
  clipboardItems: Accessor<ClipboardResourceItem[]>,
  refetch: VoidFunction,
  write: ClipboardSetter,
] => {
  if (isServer) {
    return [() => [], () => void 0, async () => void 0];
  }

  // equals: false so that setTrigger() always triggers a re-run, even if
  // called multiple times with the same (undefined) value.
  const [trigger, setTrigger] = createSignal<undefined>(undefined, { equals: false });

  const clipboard = createMemo<ClipboardResourceItem[]>(prev => {
    trigger(); // track for manual refetch
    // First evaluation: return [] synchronously so the accessor never suspends
    // on initial render. Subsequent evaluations read the clipboard asynchronously.
    if (prev === undefined) return [];
    return readClipboardItems();
  });

  const refetch = () => setTrigger();

  navigator.clipboard.addEventListener("clipboardchange", refetch);
  onCleanup(() => navigator.clipboard.removeEventListener("clipboardchange", refetch));

  if (data) {
    // Skip the first effect run by default — writing to clipboard should be
    // triggered by explicit data changes, not by component mount.
    let skip = deferInitial !== false;
    createEffect(
      () => data(),
      value => {
        if (skip) {
          skip = false;
          return;
        }
        writeClipboard(value);
      },
    );
  }

  return [clipboard, refetch, writeClipboard];
};

/**
 * A directive factory for writing to clipboard on click.
 *
 * Solid 2.0 replaced `use:directive` with `ref` directive factories.
 * Apply as: `<input ref={copyToClipboard()} />`
 *
 * On an `<input>` or `<textarea>`, captures the element's `value`.
 * On any other element, captures `innerHTML`.
 * Both can be overridden via `options.value`.
 *
 * @example
 * ```tsx
 * // Simplest form — copies input value on click
 * <input type="text" ref={copyToClipboard()} />
 *
 * // With explicit value
 * <button ref={copyToClipboard({ value: "copy me" })}>Copy</button>
 *
 * // With reactive options
 * <button ref={copyToClipboard(() => ({ value: text() }))}>Copy</button>
 * ```
 */
export const copyToClipboard = (options?: MaybeAccessor<CopyToClipboardOptions>) => {
  let _el: HTMLElement | undefined;

  const setValue = () => {
    if (!_el) return;
    const opts = access(options ?? ({} as CopyToClipboardOptions));
    let data = opts.value;
    if (!data) {
      // @ts-expect-error — indexing with a computed key
      data = _el[["input", "textarea"].includes(_el.tagName.toLowerCase()) ? "value" : "innerHTML"];
    }
    const write = opts.setter ?? ((d: any) => navigator.clipboard.writeText(d));
    if (opts.highlight) opts.highlight(_el);
    write(data);
  };

  onCleanup(() => _el?.removeEventListener("click", setValue));

  return (el: HTMLElement) => {
    _el = el;
    el.addEventListener("click", setValue);
  };
};

/**
 * newClipboardItem is a wrapper method around creating new ClipboardItems.
 *
 * @param type - The MIME type of the item to create
 * @param data - Data to populate the item with
 * @returns Provides a ClipboardItem object
 */
export const newClipboardItem: NewClipboardItem = (type, data) =>
  new ClipboardItem({ [type]: data });

/**
 * @deprecated Use `newClipboardItem` instead.
 */
export const newItem = newClipboardItem;

/**
 * A modifier that highlights/selects a range on an HTML element.
 */
export const element: Highlighter = (start: number = 0, end: number = 0) => {
  return (node: HTMLElement) => {
    const text = node.childNodes[0]!;
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
 */
export const input: Highlighter = (start?: number, end?: number) => {
  return (node: HTMLInputElement) => {
    node.setSelectionRange(start || 0, end || node.value.length);
  };
};
