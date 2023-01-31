import { drop, filterOut, push } from "@solid-primitives/immutable";
import { Accessor, createSignal, Setter } from "solid-js";
import { createEventBus, Emit, EmitGuard, Listen } from "./eventBus";

export type EventStackPayload<E, V = E> = {
  readonly event: V;
  readonly stack: V[];
  readonly remove: VoidFunction;
};

export type EventStack<E, V = E> = {
  readonly listen: Listen<EventStackPayload<V>>;
  readonly clear: VoidFunction;
  readonly value: Accessor<V[]>;
  readonly setValue: Setter<V[]>;
  readonly remove: (value: V) => boolean;
  readonly emit: Emit<E>;
};

export type EventStackConfig<E, V = E> = {
  readonly length?: number;
  readonly emitGuard?: EmitGuard<E>;
  readonly toValue?: (event: E, stack: V[]) => V;
};

/**
 * Provides all the base functions of an event-emitter, functions for managing listeners, it's behavior could be customized with an config object.
 * Additionally it provides the emitted events in a list/history form, with tools to manage it.
 * 
 * @param config Options for the event-bus.
 * @param config.emitGuard A function that wraps the `emit` function, it's useful for adding custom behavior to the `emit` function, like batching, or debouncing.
 * 
 * @returns event stack: `{listen, emit, remove, clear, value, setValue}`
 * 
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventStack
 * 
 * @example
const bus = createEventStack<{ message: string }>();
// can be destructured:
const { listen, emit, clear, value } = bus;

const listener: EventStackListener<{ text: string }> = ({ event, stack, remove }) => {
  console.log(event, stack);
  // you can remove the value from stack
  remove();
};
bus.listen(listener);

bus.emit({ text: "foo" });

// a signal accessor:
bus.value() // => { text: string }[]

bus.setValue(stack => stack.filter(item => {...}))
 */

export function createEventStack<E extends object>(config?: EventStackConfig<E>): EventStack<E, E>;
export function createEventStack<E, V extends object>(
  config: EventStackConfig<E, V> & { toValue: (event: E, stack: V[]) => V }
): EventStack<E, V>;
export function createEventStack<E, V>(
  config: EventStackConfig<E> & {
    toValue?: (event: E, stack: V[]) => V;
  } = {}
): EventStack<E, V> {
  const { toValue = (e: any) => e as V, length = 0 } = config;

  const [stack, setValue] = /*#__PURE__*/ createSignal<V[]>([]);
  const eventEventBus = createEventBus<E>(config);
  const valueEventBus = createEventBus<EventStackPayload<V>>();

  eventEventBus.listen(event => {
    const value = toValue(event, stack());
    setValue(prev => {
      let list = push(prev, value);
      return length && list.length > length ? drop(list) : list;
    });
    valueEventBus.emit({
      event: value,
      stack: stack(),
      remove: () => remove(value)
    });
  });

  const remove: EventStack<E, V>["remove"] = value => !!setValue(p => filterOut(p, value)).removed;

  return {
    clear: valueEventBus.clear,
    listen: valueEventBus.listen,
    emit: eventEventBus.emit,
    value: stack,
    setValue,
    remove
  };
}
