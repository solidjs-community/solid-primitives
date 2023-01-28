import { noop, tryOnCleanup } from "@solid-primitives/utils";
import {
  EmitGuard,
  GenericEmit,
  GenericListener,
  GenericListenProtect,
  Remove,
  RemoveGuard
} from "./types";

export type Emitter<A0 = void, A1 = void, A2 = void> = {
  listen: GenericListenProtect<[A0, A1, A2]>;
  emit: GenericEmit<[A0, A1, A2]>;
  remove: Remove<A0, A1, A2>;
  clear: VoidFunction;
  has: (listener: GenericListener<[A0, A1, A2]>) => boolean;
  value: () => void;
};

export type EmitterConfig<A0 = void, A1 = void, A2 = void> = {
  emitGuard?: EmitGuard<A0, A1, A2>;
  removeGuard?: RemoveGuard<GenericListener<[A0, A1, A2]>>;
  beforeEmit?: GenericListener<[A0, A1, A2]>;
};

/**
 * Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object.
 * 
 * @param config Emitter configuration: `emitGuard`, `removeGuard`, `beforeEmit` functions.
 * 
 * @returns the emitter: `{listen, once, emit, remove, clear, has}`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEmitter
 * 
 * @example
// accepts up-to-3 genetic payload types
const emitter = createEmitter<string, number, boolean>();
// emitter can be destructured:
const { listen, emit, has, clear } = emitter;

const listener = (a, b, c) => console.log(a, b, c);
emitter.listen(listener);

emitter.emit("foo", 123, true);

emitter.remove(listener);
emitter.has(listener); // false
 */
export function createEmitter<A0 = void, A1 = void, A2 = void>(
  config: EmitterConfig<A0, A1, A2> = {}
): Emitter<A0, A1, A2> {
  type _Listener = GenericListener<[A0, A1, A2]>;
  type _Listen = Emitter<A0, A1, A2>["listen"];
  type _Emit = Emitter<A0, A1, A2>["emit"];
  type _Remove = Emitter<A0, A1, A2>["remove"];

  const { emitGuard, removeGuard, beforeEmit } = config;
  const protectedSet = new WeakSet<_Listener>();
  const listeners = new Set<_Listener>();

  const _remove: _Remove = listener =>
    protectedSet.has(listener) ? false : !!listeners.delete(listener);
  const remove: _Remove = removeGuard
    ? listener => removeGuard(() => _remove(listener), listener)
    : _remove;

  const listen: _Listen = (listener, protect) => {
    listeners.add(listener);
    const unsub = tryOnCleanup(() => listeners.delete(listener));
    if (!protect) return unsub;
    protectedSet.add(listener);
    return () => {
      protectedSet.delete(listener);
      unsub();
    };
  };

  const _emit: _Emit = (...payload) => {
    beforeEmit?.(...payload);
    listeners.forEach(cb => cb(...payload));
  };
  const emit: _Emit = emitGuard
    ? (...payload) =>
        emitGuard(
          // in the emitGuard's emit function: user can choose to pass arguments or not
          // if not then the original payload should be used
          (...args: [A0, A1, A2] | []) => _emit(...(args.length ? args : payload)),
          ...payload
        )
    : _emit;

  // cleanup uses set.clear() instead of clear() to always clear all the listeners,
  // ragardles of the conditions in the removeGuard
  tryOnCleanup(() => listeners.clear());

  return {
    listen,
    emit,
    remove,
    clear: () => listeners.forEach(cb => remove(cb)),
    has: listener => listeners.has(listener),
    value: noop
  };
}
