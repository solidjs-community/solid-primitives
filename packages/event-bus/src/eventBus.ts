import { Accessor, createSignal, onCleanup } from "solid-js";
import {
  ClearListeners,
  MultiArgEmit,
  EmitGuard,
  MultiArgListener,
  Remove,
  RemoveGuard,
  Unsubscribe,
  Emit
} from ".";

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

type _Config<P, V> = {
  emitGuard?: EmitGuard<P>;
  removeGuard?: RemoveGuard<EventBusListener<P, V>>;
  beforeEmit?: EventBusListener<P, V>;
};

// Initial value was NOT provided
export function createEventBus<Payload = void, V extends Payload | undefined = Payload | undefined>(
  config?: _Config<Payload, V> & {
    value?: undefined;
  }
): EventBus<Payload, V>;
// Initial value was provided
export function createEventBus<Payload = void, V extends Payload = Payload>(
  config: _Config<Payload, V> & {
    value: V;
  }
): EventBus<Payload, V>;
export function createEventBus<Payload = void, V = Payload | undefined>(
  config?: _Config<Payload, V> & {
    value?: V;
  }
): EventBus<Payload, V> {
  type _Listener = EventBusListener<Payload, V>;
  type _Listen = EventBus<Payload, V>["listen"];
  type _Emit = EventBus<Payload, V>["emit"];
  type _Remove = EventBus<Payload, V>["remove"];

  const { emitGuard, removeGuard, beforeEmit, value: initialValue } = config ?? {};
  const set = new Set<_Listener>();
  const protectedSet = new Set<_Listener>();
  const [value, setValue] = createSignal<any>(initialValue);

  const _remove: _Remove = listener =>
    protectedSet.has(listener) ? false : !!set.delete(listener);
  const remove: _Remove = removeGuard
    ? listener => removeGuard(() => _remove(listener), listener)
    : _remove;

  const listen: _Listen = (listener, protect) => {
    protect && protectedSet.add(listener);
    set.add(listener);
    const unsub = () => set.delete(listener);
    onCleanup(unsub);
    return protect
      ? () => {
          protectedSet.delete(listener);
          unsub();
        }
      : unsub;
  };

  const once: _Listen = (listener, protect) => {
    const unsub = listen((...args) => {
      unsub();
      listener(...args);
    }, protect);
    return unsub;
  };

  const _emit: _Emit = payload => {
    const prev = value();
    setValue(() => payload);
    beforeEmit?.(payload, prev);
    for (const cb of set.values()) cb(payload, prev);
  };
  const emit: _Emit = emitGuard ? (...payload) => emitGuard(_emit, ...payload) : _emit;

  const clear = () => {
    for (const cb of set.values()) remove(cb);
  };
  const has = (listener: _Listener) => set.has(listener);

  onCleanup(() => set.clear());

  return {
    remove,
    listen,
    once,
    emit,
    clear,
    has,
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
