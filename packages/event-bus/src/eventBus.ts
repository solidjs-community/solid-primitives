import { Accessor, createSignal } from "solid-js";
import { ClearListeners, Unsubscribe, Emit, createPubsub, PubsubConfig } from ".";

export type EventBusListener<Payload = void, V = Payload | undefined> = (
  payload: Payload,
  prev: V
) => void;

export type EventBusListen<Payload = void, V = Payload | undefined> = (
  listener: EventBusListener<Payload, V>,
  protect?: boolean
) => Unsubscribe;

export type EventBusRemove<Payload = void, V = Payload | undefined> = (
  listener: EventBusListener<Payload, V>
) => boolean;

export type EventBus<Payload = void, V = Payload | undefined> = {
  remove: EventBusRemove<Payload, V>;
  listen: EventBusListen<Payload, V>;
  once: EventBusListen<Payload, V>;
  emit: Emit<Payload>;
  clear: ClearListeners;
  has: (listener: EventBusListener<Payload, V>) => boolean;
  value: Accessor<V>;
};

// Initial value was NOT provided
export function createEventBus<Payload = void, V extends Payload | undefined = Payload | undefined>(
  config?: PubsubConfig<Payload, V> & {
    value?: undefined;
  }
): EventBus<Payload, V>;
// Initial value was provided
export function createEventBus<Payload = void, V extends Payload = Payload>(
  config: PubsubConfig<Payload, V> & {
    value: V;
  }
): EventBus<Payload, V>;
export function createEventBus<Payload, V>(
  config: PubsubConfig<Payload, V> & {
    value?: V;
  } = {}
): EventBus<Payload, V> {
  type _Listener = EventBusListener<Payload, V>;

  const { value: initialValue } = config;
  const pubsub = createPubsub<Payload, V>(config);

  const protectedSet = new Set<_Listener>();
  const [value, setValue] = createSignal<any>(initialValue);

  const protectedUnsub = (listener: _Listener, unsub: Unsubscribe, protect = false) => {
    if (protect) {
      protectedSet.add(listener);
      return () => {
        protectedSet.delete(listener);
        unsub();
      };
    }
    return unsub;
  };

  return {
    ...pubsub,
    listen: (listener, protect) => {
      const unsub = pubsub.listen(listener);
      return protectedUnsub(listener, unsub, protect);
    },
    once: (listener, protect) => {
      const unsub = pubsub.once(listener);
      return protectedUnsub(listener, unsub, protect);
    },
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
