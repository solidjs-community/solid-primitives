import { Accessor, createSignal, Setter } from "solid-js";
import { createEmitter, Emitter, EmitterConfig, GenericEmit } from ".";
import { push, drop } from "@solid-primitives/utils/fp";
import { filterOut } from "@solid-primitives/utils/setter";
import { Fn, Modify, objectPick } from "@solid-primitives/utils";

export type EventStackListener<V> = (event: V, stack: V[], removeFromStack: Fn) => void;

export type EventStack<E, V = E> = Modify<
  Emitter<V, V[], Fn>,
  {
    value: Accessor<V[]>;
    stack: Accessor<V[]>;
    setStack: Setter<V[]>;
    removeFromStack: (value: V) => boolean;
    emit: GenericEmit<[E]>;
  }
>;

type Config<E, V> = {
  length?: number;
  emitGuard?: EmitterConfig<E>["emitGuard"];
  removeGuard?: EmitterConfig<V, V[], Fn>["removeGuard"];
  beforeEmit?: EmitterConfig<V, V[], Fn>["beforeEmit"];
};

/**
 * Provides all the base functions of an event-emitter, functions for managing listeners, it's behavior could be customized with an config object.
 * Additionally it provides the emitted events in a list/history form, with tools to manage it.
 * 
 * @param config Emitter configuration: `emitGuard`, `removeGuard`, `beforeEmit` functions and `toValue` parsing event to a value in stack.
 * 
 * @returns event stack: `{listen, once, emit, remove, clear, has, stack, setStack, removeFromStack}`
 * 
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-bus#createEventStack
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
export function createEventStack<E extends object>(config?: Config<E, E>): EventStack<E, E>;
// Overload 1: "toValue" was set
export function createEventStack<E, V extends object>(
  config: Config<E, V> & {
    toValue: (event: E, stack: V[]) => V;
  }
): EventStack<E, V>;

export function createEventStack<E, V>(
  config: Config<E, V> & {
    toValue?: (event: E, stack: V[]) => V;
  } = {}
): EventStack<E, V> {
  const { toValue = (e: any) => e, length = 0 } = config;

  const [stack, setStack] = createSignal<V[]>([]);
  const eventEmitter = createEmitter<E>(objectPick(config, "emitGuard"));
  const valueEmitter = createEmitter<V, V[], Fn>(objectPick(config, "beforeEmit", "removeGuard"));

  eventEmitter.listen(event => {
    const value = toValue(event, stack());
    setStack(prev => {
      let list = push(prev, value);
      return length && list.length > length ? drop(list) : list;
    });
    valueEmitter.emit(value, stack(), () => removeFromStack(value));
  });

  const removeFromStack: EventStack<E, V>["removeFromStack"] = value =>
    !!setStack(filterOut(value)).removed;

  return {
    ...valueEmitter,
    emit: eventEmitter.emit,
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
