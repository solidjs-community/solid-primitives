import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";
import { Emit, Listen, Listener } from "./types";

/**
 * Very minimal interface for emiting and receiving events. Good for parent-child component communication.
 * 
 * @returns `[listen, emit, clear]`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createSimpleEmitter
 * 
 * @example
// accepts up-to-3 genetic payload types
const [listen, emit, clear] = createSimpleEmitter<string, number, boolean>();

listen((a, b, c) => console.log(a, b, c));

emit("foo", 123, true);

// clear all listeners
clear();
 */
export function createSimpleEmitter<T>(
  initial?: Listener<T>[]
): [listen: Listen<T>, emit: Emit<T>, clear: VoidFunction] {
  const set = new Set(initial);

  return [
    listener => {
      set.add(listener);
      return tryOnCleanup(() => set.delete(listener));
    },
    (payload?: any) => set.forEach(cb => cb(payload)),
    onCleanup(() => set.clear())
  ];
}
