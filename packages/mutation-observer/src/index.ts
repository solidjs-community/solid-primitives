import { onCleanup, onMount } from "solid-js";
import { access, MaybeAccessor } from "./common";

type MutationObserverAdd = (target: Node, options: MutationObserverInit) => void;

export const createMutationObserver = (
  initial: MaybeAccessor<[Node, MutationObserverInit][]>,
  callback: MutationCallback
) => {
  const instance = new MutationObserver(callback);
  const add: MutationObserverAdd = (el, options) => instance.observe(el, options);
  const start = () => {
    const elements = access(initial);
    elements.forEach(([el, options]) => add(el, options));
  };
  const stop = () => instance.takeRecords().length && instance.disconnect();
  onMount(start);
  onCleanup(() => instance.disconnect());
  return {
    add,
    start,
    stop
  };
};
