import { Accessor } from "solid-js";
import { EmitterEmit, EmitterListen, EmitterOn } from "./emitter";
import { createEventBus, Emit, Listen } from "./eventBus";

export type EventHubPayloadMap<M> = {
  [K in keyof M]: M[K] extends { emit: Emit<infer T> } ? T : never;
};

export type EventHubValue<M> = {
  [K in keyof M]: M[K] extends { value: Accessor<infer T> } ? T : never;
};

/**
 * Required interface of a EventBus, to be able to be used as a channel in the EventHub
 */
export interface EventHubChannel<T, V = T> {
  readonly listen: Listen<T>;
  readonly emit: Emit<T>;
  readonly value?: Accessor<V>;
}

export type EventHub<M extends Record<string, EventHubChannel<any>>> = M & {
  readonly on: EmitterOn<EventHubPayloadMap<M>>;
  readonly emit: EmitterEmit<EventHubPayloadMap<M>>;
  readonly listen: EmitterListen<EventHubPayloadMap<M>>;
  readonly value: EventHubValue<M>;
};

/**
 * Provides helpers for using a group of emitters.
 *
 * Can be used with `createEventBus`, `createEventBus`, `createEventStack`.
 *
 * @param defineChannels object with defined channels or a defineChannels function returning channels.
 *
 * @returns hub functions: `{on, once, off, emit, clear, clearAll, listen, remove, clearGlobal, value}` + channels available by their key
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
    typeof defineChannels === "function" ? defineChannels(createEventBus) : defineChannels;
  const value = {} as EventHubValue<M>;

  Object.entries(buses).forEach(([name, bus]) => {
    bus.value && Object.defineProperty(value, name, { get: bus.value, enumerable: true });
    bus.listen(payload => global.emit({ name, details: payload }));
  });

  return {
    ...buses,
    value,
    on: (e, a) => buses[e].listen(a),
    emit: (e, a?: any) => buses[e].emit(a),
    listen: global.listen
  };
}
