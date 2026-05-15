import { onCleanup, onSettled } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, asArray, type MaybeAccessor } from "@solid-primitives/utils";

export type MutationObserverAdd = (
  target: Node,
  options?: MaybeAccessor<MutationObserverInit>,
) => void;

export type MutationObserverReturn = [
  add: MutationObserverAdd,
  rest: {
    start: VoidFunction;
    stop: VoidFunction;
    instance: MutationObserver;
    isSupported: boolean;
  },
];

/**
 * Primitive providing the ability to watch for changes being made to the DOM tree.
 *
 * Automatically starts observing after the component settles and disconnects on cleanup.
 * The returned `add` function can be used directly as a ref to observe a single element.
 *
 * @param initial html elements to be observed by the MutationObserver
 * @param options MutationObserver options
 * @param callback function called by MutationObserver when DOM tree mutation is triggered
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutation-observer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 *
 * @example
 * ```ts
 * // Observe a single element via ref
 * const [add] = createMutationObserver([], { childList: true }, records => console.log(records));
 * <div ref={add} />
 *
 * // Observe multiple elements
 * const [add, { start, stop }] = createMutationObserver(
 *   () => [el1, el2],
 *   { attributes: true, subtree: true },
 *   records => console.log(records)
 * );
 *
 * // Per-element options
 * createMutationObserver(
 *   [[el, { childList: true }], [el2, { attributes: true }]],
 *   records => console.log(records)
 * );
 * ```
 */
export function createMutationObserver(
  initial: MaybeAccessor<Node | Node[]>,
  options: MutationObserverInit,
  callback: MutationCallback,
): MutationObserverReturn;

export function createMutationObserver(
  initial: MaybeAccessor<[Node, MutationObserverInit][]>,
  callback: MutationCallback,
): MutationObserverReturn;

export function createMutationObserver(
  initial: MaybeAccessor<Node | Node[] | [Node, MutationObserverInit][]>,
  b: MutationObserverInit | MutationCallback,
  c?: MutationCallback,
): MutationObserverReturn {
  let defaultOptions: MutationObserverInit, callback: MutationCallback;
  const isSupported = !isServer;
  if (typeof b === "function") {
    defaultOptions = {};
    callback = b;
  } else {
    defaultOptions = b;
    callback = c as MutationCallback;
  }
  const instance = isSupported ? new MutationObserver(callback) : undefined;
  const add: MutationObserverAdd = (el, options) =>
    instance?.observe(el, access(options) ?? defaultOptions);
  const start = () => {
    if (!isSupported) return;
    asArray(access(initial)).forEach(item => {
      item instanceof Node ? add(item, defaultOptions) : add(item[0], item[1]);
    });
  };
  const stop = () => instance?.disconnect();

  if (isSupported) {
    onSettled(start);
    onCleanup(stop);
  }

  return [
    add,
    {
      start,
      stop,
      instance: instance as MutationObserver,
      isSupported,
    },
  ];
}

/**
 * A standalone ref factory for observing mutations on a single element without needing
 * to call `createMutationObserver` separately. For most cases, prefer using the `add`
 * ref returned by `createMutationObserver` directly.
 *
 * @param options MutationObserver options
 * @param callback function called when mutations are observed
 * @returns a ref callback to pass to an element's `ref` prop
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutation-observer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 *
 * @example
 * ```tsx
 * <div ref={mutationObserver({ childList: true }, records => console.log(records))} />
 * ```
 */
export const mutationObserver =
  (options: MutationObserverInit, callback: MutationCallback) =>
  (target: Element): void => {
    const [add] = createMutationObserver([], callback);
    add(target, options);
  };
