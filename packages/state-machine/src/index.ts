import { createMemo, createSignal, type Accessor, untrack } from "solid-js";

/**
 * Used for restricting the user type input in {@link createMachine} generic.
 */
export type StatesBase<TStateNames extends PropertyKey> = {
  [K in TStateNames]: {
    /**
     * Value to be passed to the state callback when the machine enters that state.
     */
    readonly input?: any;
    /**
     * Value returned from the state callback.
     */
    readonly value?: any;
    /**
     * Array of state names that can be transitioned to from this state.
     */
    readonly to?: TStateNames;
  };
};

/**
 * Extracts the input type from a state definition.
 */
export type StateInput<T extends { input?: any }> = T extends { input: infer Input } ? Input : void;

/**
 * Extracts the value type from a state definition.
 */
export type StateValue<T extends { value?: any }> = T extends { value: infer Value }
  ? Value
  : undefined;

/**
 * States object with function implementations.
 * @example
 * ```ts
 * const states: MachineStates<{
 *   idle: { value: "foo"; to: ["loading"] };
 *   loading: { value: "bar"; to: ["idle"] };
 * }> = {
 *   idle: () => "foo",
 *   loading(input, next) {
 *     next("idle");
 *     return "bar";
 *   }
 * }
 * ```
 */
export type MachineStates<T extends StatesBase<keyof T>> = {
  [K in keyof T]: (input: StateInput<T[K]>, next: MachineNext<T, K>) => StateValue<T[K]>;
};

type MachineInitialDiscriminator<T extends StatesBase<keyof T>> = {
  [K in keyof T]: { type: K; input: StateInput<T[K]> } | (T[K] extends { input: any } ? never : K);
};

/**
 * Union of all possible initial states.
 */
export type MachineInitial<T extends StatesBase<keyof T>> = MachineInitialDiscriminator<T>[keyof T];

/**
 * Options object for {@link createMachine}.
 */
export type MachineOptions<T extends StatesBase<keyof T>> = {
  states: MachineStates<T>;
  initial: MachineInitial<T>;
};

type MachineStateDiscriminator<T extends StatesBase<keyof T>> = {
  [K in keyof T]: {
    readonly type: K;
    readonly value: StateValue<T[K]>;
    readonly to: MachineNext<T, K>;
  };
};

/**
 * Type of the state object returned by {@link createMachine}.
 *
 * Use with a specific state name to get the state object for that state.
 * @example
 * ```ts
 * type IdleState = MachineState<States, "idle">
 * ```
 *
 * Use with `keyof States` to get the union of all state objects.
 * @example
 * ```ts
 * type AllStates = MachineState<States, keyof States>
 * ```
 */
export type MachineState<
  T extends StatesBase<keyof T>,
  K extends keyof T,
> = MachineStateDiscriminator<T>[K];

type PossibleNextKeys<T extends StatesBase<keyof T>, TKey extends keyof T> = Exclude<
  Extract<keyof T, T[TKey] extends { to: infer To } ? To : any>,
  TKey | symbol
>;

/**
 * Type of the `next` function passed to state functions. Or the `to` property of the state object.
 *
 * Use with a specific state name to get the `next` function for that state.
 * @example
 * ```ts
 * type IdleNext = MachineNext<States, "idle">
 * ```
 *
 * Use with `keyof States` to get the union of all `next` functions.
 * @example
 * ```ts
 * type AllNext = MachineNext<States, keyof States>
 * ```
 */
export type MachineNext<T extends StatesBase<keyof T>, TKey extends keyof T> = {
  readonly [K in PossibleNextKeys<T, TKey>]: (input: StateInput<T[K]>) => void;
} & (<K extends PossibleNextKeys<T, TKey>>(
  ...args: T[K] extends { input: infer Input } ? [to: K, input: Input] : [to: K, input?: undefined]
) => void);

const EQUALS_OPTIONS = { equals: (a: { type: any }, b: { type: any }) => a.type === b.type };

/**
 * Creates a reactive state machine.
 *
 * @param options {@link MachineOptions} object.
 *
 * @returns A signal with the current state object.
 *
 * @example
 * ```ts
 * const state = createMachine<{
 *   idle: { value: "foo"; to: "loading" };
 *   loading: { input: number; value: "bar"; to: "idle" };
 * }>({
 *   initial: "idle",
 *   states: {
 *     idle(input, to) {
 *       return "foo";
 *     },
 *     loading(input, to) {
 *       setTimeout(() => to("idle"), input);
 *       return "bar";
 *     }
 *   }
 * })
 *
 * state.type // "idle"
 * state.value // "foo"
 *
 * if (state.type === "idle") {
 *   state.to.loading(1000)
 *
 *   state.type // "loading"
 *   state.value // "bar"
 * }
 * ```
 */
export function createMachine<T extends StatesBase<keyof T>>(
  options: MachineOptions<T>,
): Accessor<MachineState<T, keyof T>> & MachineState<T, keyof T> {
  const { states, initial } = options,
    to: any = (type: keyof T, value: any) => {
      setPayload({ type, value, to });
    },
    [payload, setPayload] = createSignal(
      typeof initial === "object"
        ? { type: initial.type, value: initial.input as any, to }
        : { type: initial as keyof T, value: undefined, to },
      EQUALS_OPTIONS,
    );

  for (const key of Object.keys(states)) {
    to[key as any] = (input: any) => to(key, input);
  }

  const memo = createMemo(() => {
    const next = payload();
    next.value = untrack(() => states[next.type](next.value, to));
    return next;
  }) as any;

  Object.defineProperties(memo, {
    type: { get: () => memo().type },
    value: { get: () => memo().value },
    to: { value: to },
  });

  return memo;
}
