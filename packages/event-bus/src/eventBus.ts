import { Accessor, createSignal } from "solid-js";
import { ClearListeners, Unsubscribe, Emit, createEmitter, EmitterConfig } from ".";

export type EventBusListener<Event, V = Event | undefined> = (payload: Event, prev: V) => void;

export type EventBusListen<Event, V = Event | undefined> = (
  listener: EventBusListener<Event, V>,
  protect?: boolean
) => Unsubscribe;

export type EventBusRemove<Event, V = Event | undefined> = (
  listener: EventBusListener<Event, V>
) => boolean;

export type EventBus<Event, V = Event | undefined> = {
  remove: EventBusRemove<Event, V>;
  listen: EventBusListen<Event, V>;
  once: EventBusListen<Event, V>;
  emit: Emit<Event>;
  clear: ClearListeners;
  has: (listener: EventBusListener<Event, V>) => boolean;
  value: Accessor<V>;
};

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
