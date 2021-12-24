import { Fn } from "@solid-primitives/utils";
import { Accessor, createSignal, Setter } from "solid-js";
import {
  ClearListeners,
  createPubsub,
  Emit,
  EmitGuard,
  Listener,
  PubsubConfig,
  RemoveGuard,
  Unsubscribe
} from ".";

export type EventStackListener<E, V = E> = (event: V, stack: V[], removeFromStack: Fn) => void;

export type EventStack<E, V = E> = {
  value: Accessor<V[]>;
  stack: Accessor<V[]>;
  setStack: Setter<V[]>;
  listen: (listener: EventStackListener<E, V>) => Unsubscribe;
  once: (listener: EventStackListener<E, V>) => Unsubscribe;
  emit: Emit<E>;
  removeValue: (value: V) => boolean;
  clear: ClearListeners;
};

export function createEventStack<E, V = E>(
  config: PubsubConfig<E> & {
    toValue?: (event: E) => V;
  } = {}
): EventStack<E, V> {
  const { toValue = (e: any) => e } = config;

  const [stack, setStack] = createSignal<V[]>([]);
  const eventBus = createPubsub<E>(config);
  const valueBus = createPubsub<V, V[], Fn>();

  eventBus.listen(event => {
    const value = toValue(event);
    setStack(p => [...p, value]);
    valueBus.emit(value, stack(), () => removeValue(value));
  });

  const removeValue: EventStack<E, V>["removeValue"] = value => {
    let removed: boolean = false;
    setStack(p =>
      p.filter(item => {
        if (item !== value) {
          removed = true;
          return true;
        } else return false;
      })
    );
    return removed;
  };

  return {
    value: stack,
    stack,
    setStack,
    listen: valueBus.listen,
    once: valueBus.once,
    emit: eventBus.emit,
    removeValue,
    clear: valueBus.clear
  };
}

// const x = createEventStack<string>();

// x.emit("Hello");
// x.listen((payload, stack, remove) => {});
// x.value();
