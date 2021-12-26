import { Accessor, createSignal } from "solid-js";
import { ClearListeners, Unsubscribe, Emit, createEmitter, EmitterConfig } from ".";

export type EventBusListener<Payload, V = Payload | undefined> = (
  payload: Payload,
  prev: V
) => void;

export type EventBusListen<Payload, V = Payload | undefined> = (
  listener: EventBusListener<Payload, V>,
  protect?: boolean
) => Unsubscribe;

export type EventBusRemove<Payload, V = Payload | undefined> = (
  listener: EventBusListener<Payload, V>
) => boolean;

export type EventBus<Payload, V = Payload | undefined> = {
  remove: EventBusRemove<Payload, V>;
  listen: EventBusListen<Payload, V>;
  once: EventBusListen<Payload, V>;
  emit: Emit<Payload>;
  clear: ClearListeners;
  has: (listener: EventBusListener<Payload, V>) => boolean;
  value: Accessor<V>;
};

// Initial value was NOT provided
export function createEventBus<Payload>(
  config?: EmitterConfig<Payload, Payload | undefined> & {
    value?: undefined;
  }
): EventBus<Payload, Payload | undefined>;
// Initial value was provided
export function createEventBus<Payload>(
  config: EmitterConfig<Payload, Payload> & {
    value: Payload;
  }
): EventBus<Payload, Payload>;
export function createEventBus<Payload, V>(
  config: EmitterConfig<Payload, V> & {
    value?: V;
  } = {}
): EventBus<Payload, V> {
  const { value: initialValue } = config;
  const pubsub = createEmitter<Payload, V>(config);
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
