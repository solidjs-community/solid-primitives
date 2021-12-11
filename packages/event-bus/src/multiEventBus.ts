import { Fn } from "@solid-primitives/utils";
import { ClearListeners, CookedUnsubscribe, createEventBus, EventBus, EventBusListener } from ".";

type MultiEventBusAnyListener<EventMap extends Record<string, any>> = (
  event: keyof EventMap,
  payload: EventMap[keyof EventMap]
) => void;

type MultiEventBusSubscribe<EventMap extends Record<string, any>> = {
  <Event extends keyof EventMap>(
    event: Event,
    listener: EventBusListener<EventMap[Event]>
  ): CookedUnsubscribe;
  (listener: MultiEventBusAnyListener<EventMap>): CookedUnsubscribe;
};

type MultiEventBusUnsubscribe<EventMap extends Record<string, any>> = {
  <Event extends keyof EventMap>(event: Event, listener: EventBusListener<EventMap[Event]>): void;
  (listener: MultiEventBusAnyListener<EventMap>): void;
};

type MultiEventBusEmit<EventMap extends Record<string, any>> = <Event extends keyof EventMap>(
  event: Event,
  payload: EventMap[Event]
) => void;

type MultiEventBusGuard<EventMap extends Record<string, any>> = <Event extends keyof EventMap>(
  emit: Fn,
  event: Event,
  payload: EventMap[Event]
) => void;

type MutliEventClear<EventMap extends Record<string, any>> = {
  (event: keyof EventMap): void;
  (): void;
};

type MultiEventBus<EventMap extends Record<string, any>> = {
  add: MultiEventBusSubscribe<EventMap>;
  once: MultiEventBusSubscribe<EventMap>;
  remove: MultiEventBusUnsubscribe<EventMap>;
  emit: MultiEventBusEmit<EventMap>;
  clear: MutliEventClear<EventMap>;
  clearAll: ClearListeners;
};

export function createMultiEventBus<EventMap extends Record<string, any>>(
  guard?: MultiEventBusGuard<EventMap>
): MultiEventBus<EventMap> {
  const anyBus = createEventBus<keyof EventMap, EventMap[keyof EventMap]>();
  const map = {} as Record<keyof EventMap, EventBus<any>>;
  const get = (event: keyof EventMap): EventBus<any> => {
    if (!map[event]) {
      map[event] = createEventBus(guard ? (e, p) => guard(e, event, p) : undefined);
      map[event].add(payload => anyBus.emit(event, payload));
    }
    return map[event];
  };

  const remove: MultiEventBusUnsubscribe<EventMap> = (a: any, b?: any) =>
    typeof a === "function" ? anyBus.remove(a) : map[a]?.remove(b);

  const add: MultiEventBusSubscribe<EventMap> = (a: any, b?: any) =>
    typeof a === "function" ? anyBus.add(a) : get(a).add(b);

  const once: MultiEventBusSubscribe<EventMap> = (a: any, b?: any) =>
    typeof a === "function" ? anyBus.once(a) : get(a).once(b);

  const emit: MultiEventBusEmit<EventMap> = (event, payload) => map[event]?.emit(payload);

  const clear: MutliEventClear<EventMap> = (event?: any) =>
    event ? map[event]?.clear() : anyBus.clear();

  const clearAll = () => Object.keys(map).forEach(event => map[event].clear());

  return { add, remove, once, emit, clear, clearAll };
}
