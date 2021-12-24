import { onCleanup } from "solid-js";
import { ClearListeners, MultiArgEmit, MultiArgListen, MultiArgListener } from ".";

export function createSimplePubsub<A0 = void, A1 = void, A2 = void>(): [
  listen: MultiArgListen<A0, A1, A2>,
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
