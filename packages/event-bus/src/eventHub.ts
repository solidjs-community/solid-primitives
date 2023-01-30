import { Accessor } from "solid-js";
import { createEventBus, Emit, Listen, Listener } from "./eventBus";

export type EventHubPayloadMap<M> = {
  [K in keyof M]: M[K] extends { emit: Emit<infer T> } ? T : never;
};

export type EventHubValue<M> = {
  [K in keyof M]: M[K] extends { value: Accessor<infer T> } ? T : never;
};

export type EventHubPayload<M extends Record<string, EventHubChannel<any>>> = {
  [K in keyof M]: { readonly name: K; readonly details: EventHubPayloadMap<M>[K] };
}[keyof M];

export type EventHubListener<M extends Record<string, EventHubChannel<any>>> = (
  payload: EventHubPayload<M>
) => void;

export type EventHubOn<M extends Record<string, EventHubChannel<any>>> = <K extends keyof M>(
  name: K,
  listener: Listener<EventHubPayloadMap<M>[K]>
) => VoidFunction;

export type EventHubEmit<M extends Record<string, EventHubChannel<any>>> = <K extends keyof M>(
  name: K,
  ..._: void extends EventHubPayloadMap<M>[K]
    ? [payload?: EventHubPayloadMap<M>[K]]
    : [payload: EventHubPayloadMap<M>[K]]
) => void;

/**
 * Required interface of a EventBus, to be able to be used as a channel in the EventHub
 */
export interface EventHubChannel<T, V = T> {
  readonly listen: Listen<T>;
  readonly emit: Emit<T>;
  readonly value?: Accessor<V>;
}

export type EventHub<M extends Record<string, EventHubChannel<any>>> = M & {
  readonly on: EventHubOn<M>;
  readonly emit: EventHubEmit<M>;
  readonly listen: (listener: EventHubListener<M>) => VoidFunction;
  readonly store: EventHubValue<M>;
};

/**
 * Provides helpers for using a group of emitters.
 *
 * Can be used with `createEventBus`, `createEventBus`, `createEventStack`.
 *
 * @param defineChannels object with defined channels or a defineChannels function returning channels.
 *
 * @returns hub functions: `{on, once, off, emit, clear, clearAll, listen, remove, clearGlobal, store}` + channels available by their key
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-bus#createEventHub
 *
 * @example
 * const hub = createEventHub({
 *    busA: createEventBus<void>(),
 *    busB: createEventBus<string>(),
 *    busC: createEventStack<{ text: string }>()
 * });
 * // can be destructured
 * const { busA, busB, on, off, listen, emit, clear } = hub;
 *
 * hub.on("busA", e => {});
 * hub.on("busB", e => {});
 *
 * hub.emit("busA", 0);
 * hub.emit("busB", "foo");
 */

export function createEventHub<M extends Record<string, EventHubChannel<any>>>(
  defineChannels: ((bus: typeof createEventBus) => M) | M
): EventHub<M> {
  const global = /*#__PURE__*/ createEventBus<{ name: string; details: any }>();
  const buses =
    typeof defineChannels === "function"
      ? /*#__PURE__*/ defineChannels(createEventBus)
      : defineChannels;
  const store = {} as EventHubValue<M>;

  Object.entries(buses).forEach(([name, bus]) => {
    bus.value && Object.defineProperty(store, name, { get: bus.value, enumerable: true });
    bus.listen(payload => global.emit({ name, details: payload }));
  });

  return {
    ...buses,
    store,
    on: (e, a) => buses[e].listen(a),
    emit: (e, a?: any) => buses[e].emit(a),
    listen: /*#__PURE__*/ global.listen
  };
}
