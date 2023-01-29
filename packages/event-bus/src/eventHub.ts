import { Values } from "@solid-primitives/utils";
import { Accessor } from "solid-js";
import { createEventBus } from "./eventBus";
import { Emit, Listen, Listener, Remove } from "./types";

type PayloadMap<ChannelMap extends Record<string, any>> = {
  [Name in keyof ChannelMap]: ChannelMap[Name] extends EventHubChannel<infer T> ? T : never;
};

type ValueMap<ChannelMap extends Record<string, any>> = {
  [Name in keyof ChannelMap]: ChannelMap[Name] extends EventHubChannel<infer T> ? T : never;
};

export type EventHubListener<ChannelMap extends Record<string, EventHubChannel<any>>> = (
  name: keyof ChannelMap,
  payload: Values<PayloadMap<ChannelMap>>
) => void;

export type EventHubOn<ChannelMap extends Record<string, EventHubChannel<any>>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: Listener<PayloadMap<ChannelMap>[Name]>
) => VoidFunction;

export type EventHubOff<ChannelMap extends Record<string, EventHubChannel<any>>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: Listener<PayloadMap<ChannelMap>[Name]>
) => boolean;

export type EventHubEmit<ChannelMap extends Record<string, EventHubChannel<any>>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  ..._: void extends PayloadMap<ChannelMap>[Name]
    ? [payload?: PayloadMap<ChannelMap>[Name]]
    : [payload: PayloadMap<ChannelMap>[Name]]
) => void;

/**
 * Required interface of a EventBus, to be able to be used as a channel in the EventHub
 */
export interface EventHubChannel<T> {
  remove: Remove<T>;
  listen: Listen<T>;
  emit: Emit<T>;
  clear: VoidFunction;
  value?: Accessor<any>;
}

export type EventHub<ChannelMap extends Record<string, EventHubChannel<any>>> = ChannelMap & {
  on: EventHubOn<ChannelMap>;
  off: EventHubOff<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: VoidFunction;
  listen: (listener: EventHubListener<ChannelMap>) => VoidFunction;
  clearGlobal: VoidFunction;
  store: ValueMap<ChannelMap>;
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

export function createEventHub<ChannelMap extends Record<string, EventHubChannel<any>>>(
  defineChannels: ((bus: typeof createEventBus) => ChannelMap) | ChannelMap
): EventHub<ChannelMap> {
  const global = createEventBus<[string, any]>();
  const buses =
    typeof defineChannels === "function" ? defineChannels(createEventBus) : defineChannels;
  const store: Record<string, any> = {};

  Object.entries(buses).forEach(([name, bus]) => {
    bus.value && Object.defineProperty(store, name, { get: bus.value, enumerable: true });
    bus.listen(payload => global.emit([name, payload]));
  });

  return {
    ...buses,
    store: store as ValueMap<ChannelMap>,
    on: (e, a) => buses[e].listen(a),
    off: (e, a) => buses[e].remove(a),
    emit: (e, a?: any) => buses[e].emit(a),
    clear: e => buses[e].clear(),
    clearAll: () => Object.values(buses).forEach(bus => bus.clear()),
    listen(listener) {
      return global.listen(([name, payload]) => listener(name, payload));
    },
    clearGlobal: global.clear.bind(global)
  };
}

// /* Type Check */
// import { createEventStack, EventBus } from ".";
// const hub = createEventHub(bus => ({
//   test: bus<string>(),
//   other: bus<void>(),
//   news: bus<[Date, string]>(),
//   foo: createEventBus<[Date, string, number]>(),
//   bus: createEventBus<number>()
//   // messages: createEventStack({
//   //   toValue: (e: string) => ({ text: e })
//   // })
// }));

// hub.on("news", ([date, message]) => {});
// hub.on("foo", ([date, message, number]) => {});

// hub.off("test", message => {});
// hub.off("news", ([date, message]) => {});

// hub.emit("news", [new Date(), "HELLO"]);
// hub.emit("test", "HELLO");
// hub.emit("foo", [new Date(), "HELLO", 123]);
// hub.emit("other");

// hub.listen((name, payload) => {});

// hub.clear("other");
// hub.clearAll();
// // clearGlobal();

// hub.store.test;
// hub.store.news;
// hub.store.bus;

// // hub.store.messages;
// // hub.messages.value;
