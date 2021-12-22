import { onCleanup } from "solid-js";
import { ClearListeners, MultiArgEmit, MultiArgListen, MultiArgListener, Remove } from ".";

export function createSimplePubsub<A0 = void, A1 = void, A2 = void>(): [
  listen: MultiArgListen<A0, A1, A2>,
  emit: MultiArgEmit<A0, A1, A2>,
  rest: {
    once: MultiArgListen<A0, A1, A2>;
    remove: Remove<A0, A1, A2>;
    clear: ClearListeners;
    has: (listener: MultiArgListener<A0, A1, A2>) => boolean;
  }
] {
  type _Listener = MultiArgListener<A0, A1, A2>;
  type _Listen = MultiArgListen<A0, A1, A2>;
  type _Emit = MultiArgEmit<A0, A1, A2>;
  type _Remove = Remove<A0, A1, A2>;

  const set = new Set<_Listener>();

  const remove: _Remove = listener => !!set.delete(listener);

  const listen: _Listen = listener => {
    set.add(listener);
    onCleanup(() => remove(listener));
    return () => remove(listener);
  };

  const emit: _Emit = (...payload) => {
    for (const cb of set.values()) cb(...payload);
  };

  const once: _Listen = listener => {
    const unsub = listen((...args) => {
      unsub();
      listener(...args);
    });
    return unsub;
  };

  return [
    listen,
    emit,
    {
      once,
      remove: listener => set.delete(listener),
      has: listener => set.has(listener),
      clear: () => set.clear()
    }
  ];
}
