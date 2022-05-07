import { Many, MaybeAccessor, forEachEntry } from "@solid-primitives/utils";
import { createEventListener } from "./eventListener";
import { EventMapOf, TargetWithEventMap, EventListenerOptions } from "./types";

export type EventHandlersMap<EventMap> = {
  [EventName in keyof EventMap]: (event: EventMap[EventName]) => void;
};

/**
 * A helpful primitive that listens to a map of events. Handle them by individual callbacks.
 *
 * @param target accessor or variable of multiple or single event targets
 * @param handlersMap e.g. `{ mousemove: e => {}, click: e => {} }`
 * @param options e.g. `{ passive: true }`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventListenerMap
 *
 * @example
 * createEventListenerMap(element, {
 *   mousemove: mouseHandler,
 *   mouseenter: e => {},
 *   touchend: touchHandler
 * });
 */

// Custom Events
export function createEventListenerMap<
  EventMap extends Record<string, Event>,
  UsedEvents extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  handlersMap: Partial<Pick<EventHandlersMap<EventMap>, UsedEvents>>,
  options?: EventListenerOptions
): void;

// DOM Events
export function createEventListenerMap<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  HandlersMap extends Partial<EventHandlersMap<EventMap>>
>(
  target: MaybeAccessor<Many<Target>>,
  handlersMap: HandlersMap,
  options?: EventListenerOptions
): void;

export function createEventListenerMap(
  targets: MaybeAccessor<Many<EventTarget>>,
  handlersMap: Record<string, any>,
  options?: EventListenerOptions
): void {
  forEachEntry(handlersMap, (eventName, handler) => {
    if (handler) createEventListener(targets, eventName, handler, options);
  });
}

// /* Type Check */
// const mouseHandler = (e: MouseEvent) => {};
// const touchHandler = (e: TouchEvent) => {};
// const eventHandler = (e: Event) => {};
// const el = document.createElement("div");
// createEventListenerMap(el, {
//   mousemove: mouseHandler,
//   mouseenter: e => {},
//   touchend: touchHandler
// });

// createEventListenerMap<{
//   test: Event;
//   custom: MouseEvent;
//   unused: Event;
// }>(el, {
//   test: eventHandler,
//   custom: e => {}
// });

// createEventListenerMap<
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
