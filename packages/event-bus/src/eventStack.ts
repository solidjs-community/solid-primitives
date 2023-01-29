import { drop, filterOut, pick, push } from "@solid-primitives/immutable";
import { Modify } from "@solid-primitives/utils";
import { Accessor, createSignal, Setter } from "solid-js";
import { createEventBus, EventBus, EventBusConfig } from "./eventBus";
import { Emit } from "./types";

export type EventStackPayload<V> = {
  event: V;
  stack: V[];
  removeFromStack: VoidFunction;
};

export type EventStack<E, V = E> = Modify<
  EventBus<EventStackPayload<V>>,
  {
    value: Accessor<V[]>;
    stack: Accessor<V[]>;
    setStack: Setter<V[]>;
    removeFromStack: (value: V) => boolean;
    emit: Emit<E>;
  }
>;

export type EventStackConfig<E> = {
  length?: number;
  emitGuard?: EventBusConfig<E>["emitGuard"];
};

/**
 * Provides all the base functions of an event-emitter, functions for managing listeners, it's behavior could be customized with an config object.
 * Additionally it provides the emitted events in a list/history form, with tools to manage it.
 * 
 * @param config EventBus configuration: `emitGuard`, `removeGuard`, `beforeEmit` functions and `toValue` parsing event to a value in stack.
 * 
 * @returns event stack: `{listen, once, emit, remove, clear, has, stack, setStack, removeFromStack}`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventStack
 * 
 * @example
const bus = createEventStack<{ message: string }>();
// can be destructured:
const { listen, emit, has, clear, stack } = bus;

const listener: EventStackListener<{ text: string }> = (event, stack, removeValue) => {
  console.log(event, stack);
  // you can remove the value from stack
  removeValue();
};
bus.listen(listener);

bus.emit({text: "foo"});

// a signal accessor:
bus.stack() // => { text: string }[]

bus.removeFromStack(value) // pass a reference to the value

bus.setStack(stack => stack.filter(item => {...}))
 */

// Overload 0: "toValue" was not passed
export function createEventStack<E extends object>(config?: EventStackConfig<E>): EventStack<E, E>;
// Overload 1: "toValue" was set
export function createEventStack<E, V extends object>(
  config: EventStackConfig<E> & {
    toValue: (event: E, stack: V[]) => V;
  }
): EventStack<E, V>;

export function createEventStack<E, V>(
  config: EventStackConfig<E> & {
    toValue?: (event: E, stack: V[]) => V;
  } = {}
): EventStack<E, V> {
  const { toValue = (e: any) => e, length = 0 } = config;

  const [stack, setStack] = createSignal<V[]>([]);
  const eventEventBus = createEventBus<E>(pick(config, "emitGuard"));
  const valueEventBus = createEventBus<EventStackPayload<V>>();

  eventEventBus.listen(event => {
    const value = toValue(event, stack());
    setStack(prev => {
      let list = push(prev, value);
      return length && list.length > length ? drop(list) : list;
    });
    valueEventBus.emit({
      event: value,
      stack: stack(),
      removeFromStack: () => removeFromStack(value)
    });
  });

  const removeFromStack: EventStack<E, V>["removeFromStack"] = value =>
    !!setStack(p => filterOut(p, value)).removed;

  return {
    ...valueEventBus,
    emit: eventEventBus.emit,
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
