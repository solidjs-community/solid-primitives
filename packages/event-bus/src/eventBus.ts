import { Accessor, createSignal } from "solid-js";
import {
  BeforeEmit,
  ClearListeners,
  CookedUnsubscribe,
  createPubSub,
  Listener,
  Remove
} from "./pubsub";

export type EventBusListen<Payload> = (
  listener: Listener<Payload>,
  protect?: boolean
) => CookedUnsubscribe;

export type EventBusHas<Payload> = (listener: Listener<Payload>) => boolean;

export type EventBus<Payload = void> = {
  listen: EventBusListen<Payload>;
  once: EventBusListen<Payload>;
  remove: Remove<Payload>;
  emit: (payload: Payload) => void;
  has: EventBusHas<Payload>;
  clear: ClearListeners;
  value: Accessor<undefined | Payload>;
};

export function createEventBus<Payload = void>(guard?: BeforeEmit<Payload>): EventBus<Payload> {
  const [value, setValue] = createSignal<Payload>();
  const setLastValue = (v: any) => setValue(() => v);
  const protectedSet = new Set<Listener<Payload>>();

  const pubsub = createPubSub<Payload>({
    beforeRemove: (remove, fn) => (protectedSet.has(fn) || fn === setLastValue ? false : remove()),
    beforeEmit: guard
  });
  pubsub.listen(setLastValue);

  const listen: EventBusListen<Payload> = (listener, protect) => {
    const unsub = pubsub.listen(listener);
    if (protect) {
      protectedSet.add(listener);
      const _unsub = () => {
        protectedSet.delete(listener);
        unsub();
      };
      return _unsub;
    }
    return unsub;
  };

  const once: EventBusListen<Payload> = (listener, protect) => {
    const unsub = listen((...payload) => {
      unsub();
      listener(...payload);
    }, protect);
    return unsub;
  };

  return {
    remove: pubsub.remove,
    listen,
    once,
    emit: pubsub.emit,
    clear: pubsub.clear,
    has: pubsub.has,
    value
  };
}
