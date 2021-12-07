import { access, Many, MaybeAccessor, entries } from "@solid-primitives/utils";
import { createEffect } from "solid-js";
import { createStore, Store } from "solid-js/store";
import { createEventListener, EventMapOf, TargetWithEventMap } from ".";

export type EventHandlersMap<EventMap> = {
  [EventName in keyof EventMap]: (event: EventMap[EventName]) => void;
};

// Custom Events
export function createEventListenerMap<
  EventMap extends Record<string, Event>,
  UsedEvents extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  handlersMap: MaybeAccessor<Partial<Pick<EventHandlersMap<EventMap>, UsedEvents>>>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Store<Partial<Pick<EventMap, UsedEvents>>>;

// DOM Events
export function createEventListenerMap<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  HandlersMap extends Partial<EventHandlersMap<EventMap>>
>(
  target: MaybeAccessor<Many<Target>>,
  handlersMap: MaybeAccessor<HandlersMap>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Store<Partial<Pick<EventMap, keyof EventMap & keyof HandlersMap>>>;

export function createEventListenerMap(
  targets: MaybeAccessor<Many<EventTarget>>,
  handlersMap: MaybeAccessor<Record<string, any>>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Store<Record<string, Event>> {
  const [lastEvents, setLastEvents] = createStore<Record<string, Event>>({});
  createEffect(() => {
    entries(handlersMap).forEach(([eventName, handler]) => {
      createEventListener(
        targets,
        eventName,
        e => {
          setLastEvents(eventName, e);
          handler?.(e);
        },
        access(options)
      );
    });
  });
  return lastEvents;
}

// /* Type Check */
// const mouseHandler = (e: MouseEvent) => {};
// const touchHandler = (e: TouchEvent) => {};
// const eventHandler = (e: Event) => {};
// const el = document.createElement("div");
// const lastEvents = createEventListenerMap(el, {
//   mousemove: mouseHandler,
//   mouseenter: e => {},
//   touchend: touchHandler
// });
// lastEvents.touchend; // TouchEvent | undefined
// lastEvents.mousemove; // MouseEvent | undefined
// lastEvents.click; // ERROR

// const lastEvents2 = createEventListenerMap<{
//   test: Event;
//   custom: MouseEvent;
//   unused: Event;
// }>(el, {
//   test: eventHandler,
//   custom: e => {}
// });
// lastEvents2.custom; // MouseEvent | undefined
// lastEvents2.test; // Event | undefined
// lastEvents2.unused; // Event | undefined (we need to use the second generic to have proper types for the returned store)

// const lastEvents3 = createEventListenerMap<
//   {
//     test: Event;
//     custom: MouseEvent;
//     unused: Event;
//   },
//   "test" | "custom"
// >(el, {
//   test: eventHandler,
//   custom: e => {},
//   unused: e => {} // ERROR
// });
// lastEvents3.custom; // MouseEvent | undefined
// lastEvents3.test; // Event | undefined
// lastEvents3.unused; // ERROR
