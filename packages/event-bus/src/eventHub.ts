import {
  ClearListeners,
  Unsubscribe,
  createEventBus,
  createEmitter,
  Listener,
  GenericListenProtect
} from ".";
import { Accessor } from "solid-js";

type EventMap<ChannelMap extends Record<string, EventHubChannel>> = {
  [Event in keyof ChannelMap]: NonNullable<ReturnType<ChannelMap[Event]["value"]>>;
};

type ValueMap<ChannelMap extends Record<string, EventHubChannel>> = {
  [Event in keyof ChannelMap]: ReturnType<ChannelMap[Event]["value"]>;
};

export type EventHubListener<ChannelMap extends Record<string, EventHubChannel>> = <
  Event extends keyof ChannelMap
>(
  name: Event,
  event: EventMap<ChannelMap>[Event]
) => void;

export type EventHubListen<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: Listener<EventMap<ChannelMap>[Name]>,
  protect?: boolean
) => Unsubscribe;

export type EventHubRemove<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap
>(
  name: Name,
  listener: Listener<EventMap<ChannelMap>[Name]>
) => boolean;

export type EventHubEmit<ChannelMap extends Record<string, EventHubChannel>> = <
  Name extends keyof ChannelMap,
  Event extends EventMap<ChannelMap>[Name]
>(
  ...a: Event extends void ? [name: Name] : [name: Name, event: Event]
) => void;

export interface EventHubChannel<Event = void, V = Event | undefined> {
  remove: (fn: Listener<Event>) => boolean;
  listen: GenericListenProtect<Listener<Event>>;
  once: GenericListenProtect<Listener<Event>>;
  emit: (event: Event) => void;
  clear: ClearListeners;
  value: Accessor<V>;
}

export type EventHub<ChannelMap extends Record<string, EventHubChannel>> = ChannelMap & {
  listen: EventHubListen<ChannelMap>;
  once: EventHubListen<ChannelMap>;
  remove: EventHubRemove<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: ClearListeners;
  globalListen: (listener: EventHubListener<ChannelMap>) => Unsubscribe;
  globalRemove: (listener: EventHubListener<ChannelMap>) => void;
  globalClear: ClearListeners;
  value: ValueMap<ChannelMap>;
};

export function createEventHub<ChannelMap extends Record<string, EventHubChannel<any, any>>>(
  createBuses: (bus: typeof createEventBus) => ChannelMap
): EventHub<ChannelMap> {
  const global = createEmitter<string, any>();
  const buses = createBuses(createEventBus);
  const store: Record<string, any> = {};

  Object.entries(buses).forEach(([name, bus]) => {
    Object.defineProperty(store, name, { get: bus.value, enumerable: true });
    bus.listen(event => global.emit(name, event), true);
  });

  return {
    ...buses,
    value: store as ValueMap<ChannelMap>,
    listen: (e, ...a) => buses[e].listen(...a),
    once: (e, ...a) => buses[e].once(...a),
    remove: (e, fn) => buses[e].remove(fn),
    emit: (e, data?: any) => buses[e].emit(data),
    clear: e => buses[e].clear(),
    clearAll: () => Object.values(buses).forEach(bus => bus.clear()),
    globalListen: global.listen,
    globalRemove: global.remove,
    globalClear: global.clear
  };
}

// /* Type Check */
// const { test, other, bus, news, messages, listen, remove, emit, clear, clearAll, value } =
//   createEventHub(bus => ({
//     test: bus<string>({ value: "Initial" }),
//     other: bus<void>(),
//     news: bus<[Date, string]>(),
//     foo: createEmitter<Date>(),
//     bus: createEventBus<number>(),
//     messages: createEventStack({
//       toValue: (e: string) => ({ text: e })
//     })
//   }));

// listen("news", ([date, message]) => {});
// // listen((event, payload) => {});

// remove("test", message => {});
// // remove((event, message) => {});

// emit("news", [new Date(), "HELLO"]);

// clear("other");
// clearAll();
// // clearGlobal();

// value.test;
// value.news;
// value.bus;

// value.messages;
// messages.value;
