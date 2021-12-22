import { Fn, Modify } from "@solid-primitives/utils";
import { Accessor, createSignal } from "solid-js";
import { createEventBus, createPubsub, EventBus, EventBusListener, Listener, Unsubscribe } from ".";

type EventStack<T> = Modify<
  EventBus<T, T[]>,
  {
    value: Accessor<T[]>;
  }
>;

export function createEventStack<E, V = E>(config?: { toValue?: (event: E) => V }) {
  const { toValue = (e: any) => e } = config ?? {};

  const [stack, setStack] = createSignal<V[]>([]);
  const [busListen, busEmit] = createPubsub<V>();
  
  const emit = (event: E) => {
    const value = toValue(event);
    setStack(p => [...p, value])
    busEmit(value)
  }

  const removeValue = (value: V): boolean => {
    let removed: boolean = false;
    setStack(p =>
      p.filter(item => {
        if (item === value) {
          removed = true;
          return true;
        } else return false;
      })
    );
    return removed;
  };

  const listen = (listener: (event: V, stack: V[], removeFromStack: Fn) => void): Unsubscribe => {
    return busListen(event => listener(event, stack(), () => removeValue(event)));
  };

  return { value: stack, listen, emit };
}

const x = createEventStack<string>();

x.emit("Hello");
x.listen((payload, stack, remove) => {});
x.value();
