import {
  ClearListeners,
  CookedUnsubscribe,
  createEventBus,
  EventBus,
  EventBusListener,
  Fn
} from ".";

export type MultiEventBusAnyListener<EventMap extends Record<string, any>> = (
  event: keyof EventMap,
  payload: EventMap[keyof EventMap]
) => void;

export type MultiEventBusSubscribe<EventMap extends Record<string, any>> = {
  <Event extends keyof EventMap>(
    event: Event,
    listener: EventBusListener<EventMap[Event]>,
    protect?: boolean
  ): CookedUnsubscribe;
  (listener: MultiEventBusAnyListener<EventMap>, protect?: boolean): CookedUnsubscribe;
};

export type MultiEventBusUnsubscribe<EventMap extends Record<string, any>> = {
  <Event extends keyof EventMap>(event: Event, listener: EventBusListener<EventMap[Event]>): void;
  (listener: MultiEventBusAnyListener<EventMap>): void;
};

type EmitArgs<M extends Record<string, any>, R extends keyof M> = M[R] extends void
  ? [event: R]
  : [event: R, payload: M[R]];

export type MultiEventBusEmit<EventMap extends Record<string, any>> = <
  Event extends keyof EventMap
>(
  ...a: EmitArgs<EventMap, Event>
) => void;

export type MultiEventBusGuard<EventMap extends Record<string, any>> = <
  Event extends keyof EventMap
>(
  emit: Fn,
  event: Event,
  payload: EventMap[Event]
) => void;

export type MutliEventBusClear<EventMap extends Record<string, any>> = {
  (event: keyof EventMap): void;
  (): void;
};

export type MultiEventBusGet<EventMap extends Record<string, any>> = <Event extends keyof EventMap>(
  event: keyof EventMap
) => EventBus<EventMap[Event]>;

type MultiEventBus<EventMap extends Record<string, any>> = {
  listen: MultiEventBusSubscribe<EventMap>;
  once: MultiEventBusSubscribe<EventMap>;
  remove: MultiEventBusUnsubscribe<EventMap>;
  emit: MultiEventBusEmit<EventMap>;
  clear: MutliEventBusClear<EventMap>;
  clearAll: ClearListeners;
  get: MultiEventBusGet<EventMap>;
};

export function createMultiEventBus<EventMap extends Record<string, any>>(
  guard?: MultiEventBusGuard<EventMap>
): MultiEventBus<EventMap> {
  const global = createEventBus<keyof EventMap, EventMap[keyof EventMap]>();
  const map = {} as Record<keyof EventMap, EventBus<any>>;
  const get = (event: keyof EventMap): EventBus<any> => {
    if (!map[event]) {
      map[event] = createEventBus(guard ? (e, p) => guard(e, event, p) : undefined);
      map[event].listen(payload => global.emit(event, payload), true);
    }
    return map[event];
  };

  const remove: MultiEventBusUnsubscribe<EventMap> = (a: any, b?: any) =>
    typeof a === "function" ? global.remove(a) : map[a]?.remove(b);

  const listen: MultiEventBusSubscribe<EventMap> = (a: any, b?: any, c?: any) =>
    typeof a === "function" ? global.listen(a, b) : get(a).listen(b, c);

  const once: MultiEventBusSubscribe<EventMap> = (a: any, b?: any, c?: any) =>
    typeof a === "function" ? global.once(a, b) : get(a).once(b, c);

  const emit: MultiEventBusEmit<EventMap> = (event, payload?: any) => map[event]?.emit(payload);

  const clear: MutliEventBusClear<EventMap> = (event?: any) =>
    event ? map[event]?.clear() : global.clear();

  const clearAll = () => Object.values(map).forEach(list => list.clear());

  return { listen, remove, once, emit, clear, clearAll, get };
}
