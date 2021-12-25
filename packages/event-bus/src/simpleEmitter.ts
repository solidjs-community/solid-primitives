import { onCleanup } from "solid-js";
import { ClearListeners, MultiArgEmit, GenericListen, MultiArgListener } from ".";

export function createSimpleEmitter<A0 = void, A1 = void, A2 = void>(): [
  listen: GenericListen<MultiArgListener<A0, A1, A2>>,
  emit: MultiArgEmit<A0, A1, A2>,
  clear: ClearListeners
] {
  const set = new Set<MultiArgListener<A0, A1, A2>>();
  onCleanup(() => set.clear());

  return [
    listener => {
      set.add(listener);
      onCleanup(() => set.delete(listener));
      return () => set.delete(listener);
    },
    (...payload) => {
      for (const cb of set.values()) cb(...payload);
    },
    () => set.clear()
  ];
}
