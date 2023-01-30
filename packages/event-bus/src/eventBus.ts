import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export type Listener<T = void> = (payload: T) => void;

export type Listen<T = void> = (listener: Listener<T>) => VoidFunction;

export type Emit<T = void> = (..._: void extends T ? [payload?: T] : [payload: T]) => void;

export type EmitGuard<T = void> = (emit: Emit<T>, payload: T) => void;

export class EventBusCore<T> extends Set<Listener<T>> {
  emit(..._: void extends T ? [payload?: T] : [payload: T]): void;
  emit(payload?: any) {
    for (const cb of this) cb(payload);
  }
}

export interface EventBus<T> {
  readonly listen: Listen<T>;
  readonly emit: Emit<T>;
  readonly clear: VoidFunction;
}

export type EventBusConfig<T> = {
  readonly emitGuard?: EmitGuard<T>;
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
  const bus = new EventBusCore<T>();

  return {
    listen(listener) {
      bus.add(listener);
      return tryOnCleanup(bus.delete.bind(bus, listener));
    },
    emit: emitGuard
      ? (payload?: any) => emitGuard(bus.emit.bind(bus), payload)
      : bus.emit.bind(bus),
    clear: onCleanup(bus.clear.bind(bus))
  };
}
