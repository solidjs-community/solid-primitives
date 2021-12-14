import { ClearListeners, CookedUnsubscribe, createEventBus, EventBus, Listener } from ".";
import { Store } from "solid-js/store";

export type PayloadMap<ChannelMap extends Record<string, EventBus>> = {
  [Event in keyof ChannelMap]: NonNullable<ReturnType<ChannelMap[Event]["value"]>>;
};

export type EventHubListener<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap
>(
  event: Event,
  payload: PayloadMap<ChannelMap>[Event]
) => void;

export type EventHubListen<ChannelMap extends Record<string, EventBus>> = {
  <Event extends keyof ChannelMap>(
    event: Event,
    listener: Listener<PayloadMap<ChannelMap>[Event]>
  ): CookedUnsubscribe;
  (listener: EventHubListener<ChannelMap>): CookedUnsubscribe;
};

export type EventHubRemove<ChannelMap extends Record<string, EventBus>> = {
  <Event extends keyof ChannelMap>(
    event: Event,
    listener: Listener<PayloadMap<ChannelMap>[Event]>
  ): void;
  (
    listener: (event: keyof ChannelMap, payload: PayloadMap<ChannelMap>[keyof ChannelMap]) => void
  ): void;
};

export type EventHubEmit<ChannelMap extends Record<string, EventBus>> = <
  Event extends keyof ChannelMap
>(
  event: Event,
  playload: PayloadMap<ChannelMap>[Event]
) => void;

export type EventHub<ChannelMap extends Record<string, EventBus>> = ChannelMap & {
  listen: EventHubListen<ChannelMap>;
  remove: EventHubRemove<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: ClearListeners;
  clearGlobal: ClearListeners;
  value: Store<Partial<PayloadMap<ChannelMap>>>;
};

export function createEventHub<ChannelMap extends Record<string, EventBus<any>>>(
  createBuses: (bus: <T>() => EventBus<T>) => ChannelMap
): EventHub<ChannelMap> {
  const buses = createBuses(createEventBus);
  const store: Record<string, any> = {};
  Object.entries(buses).forEach(([event, bus]) => {
    Object.defineProperty(store, event, { get: bus.value, enumerable: true });
  });

  return {
    value: store as any
  };
}

const { test, other, bus, news, listen, remove, emit, clear, clearAll, clearGlobal, value } =
  createEventHub(bus => ({
    test: bus<string>(),
    other: bus<void>(),
    news: bus<[Date, string]>(),
    bus: createEventBus<void>()
  }));

listen("news", ([date, message]) => {});
listen((event, payload) => {});

remove("test", message => {});
remove((event, message) => {});

emit("news", [new Date(), "HELLO"]);

clear("other");
clearAll();
clearGlobal();

value.test;
value.news;
