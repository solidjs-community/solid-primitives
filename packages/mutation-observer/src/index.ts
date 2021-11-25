import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";
import { createMutable } from "solid-js/store";
import { access, accessAsArray, Fn, MaybeAccessor } from "./common";

type MutationObserverAdd = (target: Node, options: MutationObserverInit) => void;

type MutationObserverReturn = {
  add: MutationObserverAdd;
  start: Fn;
  stop: Fn;
};

export function createMutationObserver(
  initial: MaybeAccessor<Node | Node[]>,
  options: MutationObserverInit,
  callback: MutationCallback
): MutationObserverReturn;

export function createMutationObserver(
  initial: MaybeAccessor<[Node, MutationObserverInit][]>,
  callback: MutationCallback
): MutationObserverReturn;

export function createMutationObserver(
  initial: MaybeAccessor<Node | Node[] | [Node, MutationObserverInit][]>,
  b: MutationObserverInit | MutationCallback,
  c?: MutationCallback
): MutationObserverReturn {
  let defaultOptions: MutationObserverInit, callback: MutationCallback;
  if (typeof b === "function") {
    defaultOptions = {};
    callback = b;
  } else {
    defaultOptions = b;
    callback = c as MutationCallback;
  }
  const instance = new MutationObserver(callback);
  const add: MutationObserverAdd = (el, options) => instance.observe(el, options);
  const start = () => {
    accessAsArray(initial).forEach(item => {
      item instanceof Node ? add(item, defaultOptions) : add(item[0], item[1]);
    });
  };
  const stop = () => instance.takeRecords().length && instance.disconnect();
  onMount(start);
  onCleanup(() => instance.disconnect());
  return {
    add,
    start,
    stop
  };
}
