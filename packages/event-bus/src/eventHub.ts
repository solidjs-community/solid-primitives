import { ClearListeners, Unsubscribe, createEventBus, createEmitter } from ".";
import { Accessor } from "solid-js";
import { Keys, Values } from "@solid-primitives/utils";

type PayloadMap<ChannelMap extends Record<string, EventHubChannel>> = {
  [Name in keyof ChannelMap]: Parameters<ChannelMap[Name]["emit"]>;
};

type ValueMap<ChannelMap extends Record<string, EventHubChannel>> = {
  [Name in keyof ChannelMap]: ReturnType<ChannelMap[Name]["value"]>;
};

export type EventHubGlobalListener<ChannelMap extends Record<string, EventHubChannel>> = (
  name: Keys<ChannelMap>,
  payload: Values<PayloadMap<ChannelMap>>
) => void;

export type EventHubListen<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: (...payload: PayloadMap<ChannelMap>[Name]) => void,
  protect?: boolean
) => Unsubscribe;

export type EventHubRemove<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: (...payload: PayloadMap<ChannelMap>[Name]) => void
) => boolean;

export type EventHubEmit<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  ...payload: PayloadMap<ChannelMap>[Name]
) => void;

/**
 * Required interface of a Emitter/EventBus, to be able to be used as a channel in the EventHub
 */
export interface EventHubChannel {
  remove: (fn: (...payload: any[]) => void) => boolean;
  listen: (listener: (...payload: any[]) => void, protect?: boolean) => Unsubscribe;
  once: (listener: (...payload: any[]) => void, protect?: boolean) => Unsubscribe;
  emit: (...payload: any[]) => void;
  clear: ClearListeners;
  value: Accessor<any>;
}

export type EventHub<ChannelMap extends Record<string, EventHubChannel>> = ChannelMap & {
  on: EventHubListen<ChannelMap>;
  once: EventHubListen<ChannelMap>;
  off: EventHubRemove<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: ClearListeners;
  listen: (listener: EventHubGlobalListener<ChannelMap>, protect?: boolean) => Unsubscribe;
  remove: (listener: EventHubGlobalListener<ChannelMap>) => void;
  clearGlobal: ClearListeners;
  store: ValueMap<ChannelMap>;
};

export function createEventHub<ChannelMap extends Record<string, EventHubChannel>>(
  defineChannels: ((bus: typeof createEventBus) => ChannelMap) | ChannelMap
): EventHub<ChannelMap> {
  const global = createEmitter<string, any>();
  const buses =
    typeof defineChannels === "function" ? defineChannels(createEventBus) : defineChannels;
  const store: Record<string, any> = {};

  Object.entries(buses).forEach(([name, bus]) => {
    Object.defineProperty(store, name, { get: bus.value, enumerable: true });
    bus.listen((...payload) => global.emit(name, payload), true);
  });

  return {
    ...buses,
    store: store as ValueMap<ChannelMap>,
    on: (e, ...a) => buses[e].listen(...(a as [any])),
    once: (e, ...a) => buses[e].once(...(a as [any])),
    off: (e, ...a) => buses[e].remove(...(a as [any])),
    emit: (e, ...a) => buses[e].emit(...a),
    clear: e => buses[e].clear(),
    clearAll: () => Object.values(buses).forEach(bus => bus.clear()),
    listen: global.listen,
    remove: global.remove,
    clearGlobal: global.clear
  };
}

// /* Type Check */
// import { createEventStack, Emitter } from ".";
// const hub = createEventHub(bus => ({
//   test: bus<string>({ value: "Initial" }),
//   other: bus<void>(),
//   news: bus<[Date, string]>(),
//   foo: createEmitter<Date, string, number>(),
//   bus: createEventBus<number>(),
//   messages: createEventStack({
//     toValue: (e: string) => ({ text: e })
//   })
// }));

// hub.on("news", ([date, message]) => {});
// hub.on("foo", (date, message, number) => {});

// hub.off("test", message => {});
// hub.off("news", ([date, message]) => {});

// hub.emit("news", [new Date(), "HELLO"]);
// hub.emit("test", "HELLO");
// hub.emit("foo", new Date(), "HELLO", 123);
// hub.emit("other");

// hub.listen((name, payload) => {});

// hub.clear("other");
// hub.clearAll();
// // clearGlobal();

// type X = PayloadMap<{
//   a: Emitter<string, string>;
// }>;

// hub.store.test;
// hub.store.news;
// hub.store.bus;

// hub.store.messages;
// hub.messages.value;
