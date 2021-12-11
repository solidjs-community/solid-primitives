import { Fn } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";

export type ClearListeners = Fn;
export type CookedUnsubscribe = Fn;

export type EventBusListener<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = (
  arg0: Arg0,
  arg1: Arg1,
  arg2: Arg2,
  arg3: Arg3,
  arg4: Arg4
) => void;
export type EventBusSubscribe<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = (
  listener: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>
) => CookedUnsubscribe;
export type EventBusUnsubscribe<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = (
  listener: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>
) => void;
export type EventBusGuard<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = (
  emit: Fn,
  arg0: Arg0,
  arg1: Arg1,
  arg2: Arg2,
  arg3: Arg3,
  arg4: Arg4
) => void;

export type EventBus<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = {
  add: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  once: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  remove: EventBusUnsubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  emit: (arg0: Arg0, arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => void;
  clear: ClearListeners;
};

export function createEventBus<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void>(
  guard?: EventBusGuard<Arg0, Arg1, Arg2, Arg3, Arg4>
): EventBus<Arg0, Arg1, Arg2, Arg3, Arg4> {
  let listeners: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>[] = [];

  const remove: EventBusUnsubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = listener => {
    listeners = listeners.filter(fn => fn !== listener);
  };
  const add: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = listener => {
    listeners.push(listener);
    const unsub = () => remove(listener);
    onCleanup(unsub);
    return unsub;
  };
  const once: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = listener => {
    const unsub = add((...payload) => {
      unsub();
      listener(...payload);
    });
    return unsub;
  };
  const emit: EventBus<Arg0, Arg1, Arg2, Arg3, Arg4>["emit"] = (...payload) => {
    const _emit = () => listeners.forEach(fn => fn(...payload));
    guard ? guard(_emit, ...payload) : _emit();
  };
  const clear = () => (listeners = []);
  onCleanup(clear);

  return {
    add,
    remove,
    once,
    emit,
    clear
  };
}
