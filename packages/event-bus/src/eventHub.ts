import { ClearListeners, Unsubscribe, createEventBus, EventBus, createPubsub, Listener } from ".";
import { Store } from "solid-js/store";

type PayloadMap<ChannelMap extends Record<string, EventBus>> = {
  [Event in keyof ChannelMap]: NonNullable<ReturnType<ChannelMap[Event]["value"]>>;
};

type ValueMap<ChannelMap extends Record<string, EventBus>> = {
  [Event in keyof ChannelMap]: ReturnType<ChannelMap[Event]["value"]>;
};

export type EventHubListener<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap
>(
  event: Event,
  payload: PayloadMap<ChannelMap>[Event]
) => void;

export type EventHubListen<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap
>(
  event: Event,
  listener: Listener<PayloadMap<ChannelMap>[Event]>,
  protect?: boolean
) => Unsubscribe;

export type EventHubRemove<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap
>(
  event: Event,
  listener: Listener<PayloadMap<ChannelMap>[Event]>
) => void;

export type EventHubEmit<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap,
  Payload extends PayloadMap<ChannelMap>[Event]
>(
  ...a: Payload extends void ? [event: Event] : [event: Event, payload: Payload]
) => void;

export type EventHub<ChannelMap extends Record<string, EventBus>> = ChannelMap & {
  listen: EventHubListen<ChannelMap>;
  remove: EventHubRemove<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: ClearListeners;
  globalListen: (listener: EventHubListener<ChannelMap>) => Unsubscribe;
  globalRemove: (listener: EventHubListener<ChannelMap>) => void;
  globalClear: ClearListeners;
  value: Store<ValueMap<ChannelMap>>;
};

export function createEventHub<ChannelMap extends Record<string, EventBus<any, any>>>(
  createBuses: (bus: typeof createEventBus) => ChannelMap
): EventHub<ChannelMap> {
  const global = createPubsub<string, any>();
  const buses = createBuses(createEventBus);
  const store: Record<string, any> = {};

  Object.entries(buses).forEach(([event, bus]) => {
    Object.defineProperty(store, event, { get: bus.value, enumerable: true });
    bus.listen(payload => global.emit(event, payload), true);
  });

  return {
    ...buses,
    value: store as Store<ValueMap<ChannelMap>>,
    listen: (e, ...a) => buses[e].listen(...a),
    remove: (e, fn) => buses[e].remove(fn),
    emit: (e, data?: any) => buses[e].emit(data),
    clear: e => buses[e].clear(),
    clearAll: () => Object.values(buses).forEach(bus => bus.clear()),
    globalListen: global.listen,
    globalRemove: global.remove,
    globalClear: global.clear
  };
}

// const { test, other, bus, news, messages, listen, remove, emit, clear, clearAll, value } =
//   createEventHub(bus => ({
//     test: bus<string>({ initialValue: "Initial" }),
//     other: bus<void>(),
//     news: bus<[Date, string]>(),
//     bus: createEventBus<number>(),
//     messages: createEventStack<string>()
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
