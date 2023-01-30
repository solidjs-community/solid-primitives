import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";
import { Emit, EmitGuard, Listen, Listener, Remove } from "./types";

export type EventBus<T> = {
  listen: Listen<T>;
  emit: Emit<T>;
  remove: Remove<T>;
  clear: VoidFunction;
  has: (listener: Listener<T>) => boolean;
};

export type EventBusConfig<T> = {
  emitGuard?: EmitGuard<T>;
};

/**
 * Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object.
 * 
 * @param config EventBus configuration: `emitGuard`, `removeGuard`, `beforeEmit` functions.
 * 
 * @returns the emitter: `{listen, once, emit, remove, clear, has}`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventBus
 * 
 * @example
// accepts up-to-3 genetic payload types
const emitter = createEventBus<string, number, boolean>();
// emitter can be destructured:
const { listen, emit, has, clear } = emitter;

const listener = (a, b, c) => console.log(a, b, c);
emitter.listen(listener);

emitter.emit("foo", 123, true);

emitter.remove(listener);
emitter.has(listener); // false
 */
export function createEventBus<T>(config: EventBusConfig<T> = {}): EventBus<T> {
  const { emitGuard } = config;
  const listeners = new Set<Listener<T>>();

  const _emit: Emit<T> = (payload?: any) => listeners.forEach(cb => cb(payload));

  return {
    listen(listener) {
      listeners.add(listener);
      return tryOnCleanup(() => listeners.delete(listener));
    },
    emit: emitGuard ? (payload?: any) => emitGuard(_emit, payload) : _emit,
    remove: listener => !!listeners.delete(listener),
    clear: onCleanup(listeners.clear.bind(listeners)),
    has: listeners.has.bind(listeners)
  };
}
