import { onCleanup, onMount } from "solid-js";
import type { JSX } from "solid-js";
import { access, asArray, MaybeAccessor } from "@solid-primitives/utils";

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

export type MutationObserverStandaloneDirectiveProps = [
  options: MutationObserverInit,
  callback: MutationCallback,
];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      mutationObserver: MutationObserverInit | MutationObserverStandaloneDirectiveProps;
    }
  }
}
// this ensures the `JSX` import won't fall victim to tree shaking before typescript can use it
export type E = JSX.Element;

/**
 * Primitive providing the ability to watch for changes being made to the DOM tree.
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
 * let ref: !HTMLElement;
 * const [observe, { start, stop, instance }] = createMutationObserver(
 *   () => ref,
 *   { attributes: true, subtree: true },
 *   records => console.log(records)
 * );
 * 
 * // Usage as a directive
 * const [mutationObserver] = createMutationObserver([], e => {...})

<div use:mutationObserver={{ childList: true }}>...</div>
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
  const isSupported = typeof window !== "undefined" && "MutationObserver" in window;
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
    asArray(access(initial)).forEach(item => {
      item instanceof Node ? add(item, defaultOptions) : add(item[0], item[1]);
    });
  };
  const stop = () => instance?.takeRecords().length && instance.disconnect();
  onMount(start);
  onCleanup(stop);
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
 * Primitive providing the ability to watch for changes being made to the DOM tree.
 * A Standalone Directive.
 *
 * @param props [MutationObserver options, callback]
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/mutation-observer
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 *
 * @example
 * ```tsx
 * <div use:mutationObserver={[{ childList: true }, e => {...}]}></div>
 * ```
 */
export const mutationObserver = (
  target: Element,
  props: () => MutationObserverStandaloneDirectiveProps,
): void => {
  const [config, cb] = props();
  const [add] = createMutationObserver([], cb);
  add(target, config);
};
