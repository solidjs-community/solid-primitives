import { onCleanup } from "solid-js";
import {
  ClearListeners,
  EmitGuard,
  MultiArgEmit,
  GenericListenProtect,
  MultiArgListener,
  Remove,
  RemoveGuard
} from ".";

export type Emitter<A0 = void, A1 = void, A2 = void> = {
  listen: GenericListenProtect<MultiArgListener<A0, A1, A2>>;
  once: GenericListenProtect<MultiArgListener<A0, A1, A2>>;
  emit: MultiArgEmit<A0, A1, A2>;
  remove: Remove<A0, A1, A2>;
  clear: ClearListeners;
  has: (listener: MultiArgListener<A0, A1, A2>) => boolean;
  value: () => void;
};

export type EmitterConfig<A0 = void, A1 = void, A2 = void> = {
  emitGuard?: EmitGuard<A0, A1, A2>;
  removeGuard?: RemoveGuard<MultiArgListener<A0, A1, A2>>;
  beforeEmit?: MultiArgListener<A0, A1, A2>;
};

export function createEmitter<A0 = void, A1 = void, A2 = void>(
  config: EmitterConfig<A0, A1, A2> = {}
): Emitter<A0, A1, A2> {
  type _Listener = MultiArgListener<A0, A1, A2>;
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
    const unsub = () => listeners.delete(listener);
    onCleanup(unsub);
    if (!protect) return unsub;
    protectedSet.add(listener);
    return () => {
      protectedSet.delete(listener);
      unsub();
    };
  };

  const once: _Listen = (listener, protect) => {
    const unsub = listen((...args) => {
      unsub();
      return listener(...args);
    }, protect);
    return unsub;
  };

  const _emit: _Emit = beforeEmit
    ? (...payload) => {
        beforeEmit(...payload);
        listeners.forEach(cb => cb(...payload));
      }
    : (...payload) => listeners.forEach(cb => cb(...payload));
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
  onCleanup(() => listeners.clear());

  return {
    listen,
    once,
    emit,
    remove,
    clear: () => listeners.forEach(cb => remove(cb)),
    has: listener => listeners.has(listener),
    value: () => {}
  };
}
