import { Accessor, createSignal } from "solid-js";
import {
  ClearListeners,
  createEmitter,
  EmitterConfig,
  GenericEmit,
  GenericListener,
  ListenProtect
} from ".";

export type EventBusListener<Event, V = Event | undefined> = GenericListener<[Event, V]>;
export type EventBusListen<Event, V = Event | undefined> = ListenProtect<Event, V>;

export type EventBusRemove<Event, V = Event | undefined> = (
  listener: EventBusListener<Event, V>
) => boolean;

export type EventBus<Event, V = Event | undefined> = {
  remove: EventBusRemove<Event, V>;
  listen: EventBusListen<Event, V>;
  emit: GenericEmit<[Event]>;
  clear: ClearListeners;
  has: (listener: EventBusListener<Event, V>) => boolean;
  value: Accessor<V>;
};

/**
 * Provides all the base functions of an event-emitter, functions for managing listeners, it's behavior could be customized with an config object.
 * Additionally it provides a signal accessor function with last event's value.
 * 
 * @param config Emitter configuration: `emitGuard`, `removeGuard`, `beforeEmit` functions and `value` for setting initial value.
 * 
 * @returns event bus: `{listen, once, emit, remove, clear, has, value}`
 * 
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-bus#createEventBus
 * 
 * @example
const bus = createEventBus<string>();
// can be destructured:
const { listen, emit, has, clear, value } = bus;

const listener = (event, previous) => console.log(event, previous);
bus.listen(listener);

bus.emit("foo");

bus.remove(listener);
bus.has(listener); // false

// clear all listeners
bus.clear();
 */

// Initial value was NOT provided
export function createEventBus<Event>(
  config?: EmitterConfig<Event, Event | undefined>
): EventBus<Event, Event | undefined>;
// Initial value was provided
export function createEventBus<Event>(
  config: EmitterConfig<Event, Event> & {
    value: Event;
  }
): EventBus<Event, Event>;
export function createEventBus<Event, V>(
  config: EmitterConfig<Event, V> & {
    value?: V;
  } = {}
): EventBus<Event, V> {
  const { value: initialValue } = config;
  const pubsub = createEmitter<Event, V>(config);
  const [value, setValue] = createSignal<any>(initialValue);

  return {
    ...pubsub,
    emit: payload => {
      let prev!: V;
      setValue(p => {
        prev = p;
        return payload;
      });
      pubsub.emit(payload, prev);
    },
    value
  };
}

// type _Value<T, I> = undefined extends I ? T | undefined : T;

// function test<T = void, Init = T>(config: {
//   initialValue: T;
// }): {
//   value: _Value<T, Init>;
//   emit: (payload: T) => void;
//   listen: (fn: (payload: T, prev: _Value<T, Init>) => void) => void;
// };
// function test<T = void, Init = undefined>(config?: {
//   initialValue?: T;
// }): {
//   value: _Value<T, Init>;
//   emit: (payload: T) => void;
//   listen: (fn: (payload: T, prev: _Value<T, Init>) => void) => void;
// };
// function test<T = void, Init = undefined>(config?: {
//   initialValue?: T;
// }): {
//   value: _Value<T, Init>;
//   emit: (payload: T) => void;
//   listen: (fn: (payload: T, prev: _Value<T, Init>) => void) => void;
// } {
//   return "" as any;
// }

// const z = test();
// z.value; // void | undef
// z.emit();
// z.listen((v, p) => {});

// const x = test<string>({
//   initialValue: ""
// });
// x.value; // string
// x.emit("");
// x.listen((v, p) => {});

// const y = test<string>();
// y.value; // string | undef
// y.emit("");
// y.listen((v, p) => {});
