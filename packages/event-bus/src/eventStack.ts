import { Fn, Modify, objectPick } from "@solid-primitives/utils";
import { Accessor, createSignal, Setter } from "solid-js";
import {
  createEventBus,
  createPubsub,
  Emit,
  EmitGuard,
  EventBus,
  EventBusListener,
  Listener,
  RemoveGuard,
  Unsubscribe
} from ".";

export type EventStack<E, V = E> = {
  value: Accessor<V[]>;
  setStack: Setter<V[]>;
  listen: (listener: (event: V, stack: V[], removeFromStack: Fn) => void) => Unsubscribe;
  once: (listener: (event: V, stack: V[], removeFromStack: Fn) => void) => Unsubscribe;
  emit: Emit<E>;
  removeValue: (value: V) => boolean;
};

export function createEventStack<E, V = E>(
  config: {
    toValue?: (event: E) => V;
    emitGuard?: EmitGuard<E>;
    removeGuard?: RemoveGuard<Listener<E>>;
    beforeEmit?: Listener<E>;
  } = {}
): EventStack<E, V> {
  type _Listen = (listener: (event: V, stack: V[], removeFromStack: Fn) => void) => Unsubscribe;

  const { toValue = (e: any) => e } = config;

  const [stack, setStack] = createSignal<V[]>([]);
  const eventBus = createPubsub<E>(config);
  const valueBus = createPubsub<V>();

  eventBus.listen(event => {
    const value = toValue(event);
    setStack(p => [...p, value]);
    valueBus.emit(value);
  });

  const removeValue = (value: V): boolean => {
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

  const listen: _Listen = listener =>
    valueBus.listen(event => listener(event, stack(), () => removeValue(event)));

  const once: _Listen = listener => {
    const unsub = listen((...args) => {
      unsub();
      return listener(...args);
    });
    return unsub;
  };

  return { value: stack, setStack, listen, once, emit: eventBus.emit, removeValue };
}

const x = createEventStack<string>();

x.emit("Hello");
x.listen((payload, stack, remove) => {});
x.value();
