import { Accessor, createSignal, Setter } from "solid-js";
import { ClearListeners, createEmitter, Emit, EmitterConfig, GenericListenProtect } from ".";
import { push, drop } from "@solid-primitives/utils/fp";
import { Fn } from "@solid-primitives/utils";

export type EventStackListener<E, V = E> = (event: V, stack: V[], removeFromStack: Fn) => void;

export type EventStack<E, V = E> = {
  value: Accessor<V[]>;
  stack: Accessor<V[]>;
  setStack: Setter<V[]>;
  removeFromStack: (value: V) => boolean;
  listen: GenericListenProtect<EventStackListener<E, V>>;
  once: GenericListenProtect<EventStackListener<E, V>>;
  remove: (listener: EventStackListener<E, V>) => boolean;
  emit: Emit<E>;
  clear: ClearListeners;
};

// Overload 0: "toValue" was not passed
export function createEventStack<E extends object>(
  config?: EmitterConfig<E> & {
    length?: number;
  }
): EventStack<E, E>;
// Overload 1: "toValue" was set
export function createEventStack<E, V extends object>(
  config: EmitterConfig<E> & {
    toValue: (event: E) => V;
    length?: number;
  }
): EventStack<E, V>;

export function createEventStack<E, V>(
  config: EmitterConfig<E> & {
    toValue?: (event: E) => V;
    length?: number;
  } = {}
): EventStack<E, V> {
  const { toValue = (e: any) => e, length = 0 } = config;

  const [stack, setStack] = createSignal<V[]>([]);
  const eventBus = createEmitter<E>(config);
  const valueBus = createEmitter<V, V[], Fn>();

  eventBus.listen(event => {
    const value = toValue(event);
    setStack(p => {
      const list = push(p, value);
      return length && list.length > length ? drop(list) : list;
    });
    valueBus.emit(value, stack(), () => removeFromStack(value));
  });

  const removeFromStack: EventStack<E, V>["removeFromStack"] = value => {
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
    ...valueBus,
    emit: eventBus.emit,
    value: stack,
    stack,
    setStack,
    removeFromStack
  };
}

// /* Type Check */
// createEventStack<string>(); //Error
// createEventStack<string, { text: string }>(); //Error
// createEventStack<string, { text: string }>({
//   toValue: e => e //Error
// });

// const x = createEventStack<string[]>();
// x.emit(["Hello", "World"]);
// x.listen((payload, stack, remove) => {});
// x.value();

// const y = createEventStack({
//   toValue: (e: string) => ({ text: e })
// });
// y.emit("Hello");
// y.listen((payload, stack, remove) => {});
// y.value();
