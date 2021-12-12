import { onCleanup } from "solid-js";

export type Fn = () => void;
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
  listener: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>,
  protect?: boolean
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
export type EventBusHas<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = (
  listener: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>,
  isProtected?: boolean
) => boolean;

export type EventBus<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void> = {
  listen: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  once: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  remove: EventBusUnsubscribe<Arg0, Arg1, Arg2, Arg3, Arg4>;
  emit: (arg0: Arg0, arg1: Arg1, arg2: Arg2, arg3: Arg3, arg4: Arg4) => void;
  has: EventBusHas<Arg0, Arg1, Arg2, Arg3, Arg4>;
  clear: ClearListeners;
};

export function createEventBus<Arg0 = void, Arg1 = void, Arg2 = void, Arg3 = void, Arg4 = void>(
  guard?: EventBusGuard<Arg0, Arg1, Arg2, Arg3, Arg4>
): EventBus<Arg0, Arg1, Arg2, Arg3, Arg4> {
  const listenersSet = new Set<EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>>();
  const protectedSet = new Set<EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>>();

  const removeProtected = (listener: EventBusListener<Arg0, Arg1, Arg2, Arg3, Arg4>) =>
    protectedSet.delete(listener);
  const remove: EventBusUnsubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = listener =>
    protectedSet.delete(listener);

  const listen: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = (listener, protect) => {
    if (protect) {
      protectedSet.add(listener);
      return () => removeProtected(listener);
    } else {
      listenersSet.add(listener);
      const unsub = () => remove(listener);
      onCleanup(unsub);
      return unsub;
    }
  };
  const once: EventBusSubscribe<Arg0, Arg1, Arg2, Arg3, Arg4> = (listener, protect) => {
    const unsub = listen((...payload) => {
      unsub();
      listener(...payload);
    }, protect);
    return unsub;
  };
  const emit: EventBus<Arg0, Arg1, Arg2, Arg3, Arg4>["emit"] = (...payload) => {
    const _emit = () => {
      for (const cb of protectedSet.values()) cb(...payload);
      for (const cb of listenersSet.values()) cb(...payload);
    };
    guard ? guard(_emit, ...payload) : _emit();
  };
  const clear = () => listenersSet.clear();
  onCleanup(clear);

  const has: EventBusHas<Arg0, Arg1, Arg2, Arg3, Arg4> = (listener, isProtected) => {
    const set = isProtected ? protectedSet : listenersSet;
    return set.has(listener);
  };

  return {
    listen,
    remove,
    once,
    emit,
    clear,
    has
  };
}
