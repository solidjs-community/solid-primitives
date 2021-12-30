import { ClearListeners, GenericListener, GenericEmit, GenericListen, onRootCleanup } from ".";

/**
 * Very minimal interface for emiting and receiving events. Good for parent-child component communication.
 * 
 * @returns `[listen, emit, clear]`
 * 
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-bus#createSimpleEmitter
 * 
 * @example
// accepts up-to-3 genetic payload types
const [listen, emit, clear] = createSimpleEmitter<string, number, boolean>();

listen((a, b, c) => console.log(a, b, c));

emit("foo", 123, true);

// clear all listeners
clear();
 */
export function createSimpleEmitter<A0 = void, A1 = void, A2 = void>(): [
  listen: GenericListen<[A0, A1, A2]>,
  emit: GenericEmit<[A0, A1, A2]>,
  clear: ClearListeners
] {
  const set = new Set<GenericListener<[A0, A1, A2]>>();
  onRootCleanup(() => set.clear());

  return [
    listener => {
      set.add(listener);
      onRootCleanup(() => set.delete(listener));
      return () => set.delete(listener);
    },
    (...payload) => set.forEach(cb => cb(...payload)),
    () => set.clear()
  ];
}
