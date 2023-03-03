import { tryOnCleanup } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export type Listener<T = void> = (payload: T) => void;

export type Listen<T = void> = (listener: Listener<T>) => VoidFunction;

export type Emit<T = void> = (..._: void extends T ? [payload?: T] : [payload: T]) => void;

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

/**
 * Provides a simple way to listen to and emit events. All listeners are automatically unsubscribed on cleanup.
 * 
 * @returns the emitter: `{listen, emit, clear}`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventBus
 * 
 * @example
const bus = createEventBus<string>();
// bus can be destructured:
const { listen, emit, clear } = bus;

const unsub = bus.listen((a) => console.log(a));

bus.emit("foo");

// unsub gets called automatically on cleanup
unsub();
 */
export function createEventBus<T>(): EventBus<T> {
  const bus = new EventBusCore<T>();

  return {
    listen(listener) {
      bus.add(listener);
      return tryOnCleanup(bus.delete.bind(bus, listener));
    },
    emit: bus.emit.bind(bus),
    clear: onCleanup(bus.clear.bind(bus)),
  };
}
