import { AnyFunction, entries, Many, MaybeAccessor } from "@solid-primitives/utils";
import { createEventListener } from "./eventListener";
import { EventMapOf, TargetWithEventMap, EventListenerOptions } from "./types";
import { isServer } from "solid-js/web";

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

// DOM Events
export function createEventListenerMap<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  HandlersMap extends Partial<EventHandlersMap<EventMap>>,
>(
  target: MaybeAccessor<Many<Target>>,
  handlersMap: HandlersMap,
  options?: EventListenerOptions,
): void;

// Custom Events
export function createEventListenerMap<EventMap extends Record<string, Event>>(
  target: MaybeAccessor<Many<EventTarget>>,
  handlersMap: Partial<EventHandlersMap<EventMap>>,
  options?: EventListenerOptions,
): void;

export function createEventListenerMap(
  targets: MaybeAccessor<Many<EventTarget>>,
  handlersMap: Record<string, AnyFunction | undefined>,
  options?: EventListenerOptions,
): void {
  if (isServer) {
    return;
  }
  for (const [eventName, handler] of entries(handlersMap)) {
    if (handler) createEventListener(targets, eventName, handler, options);
  }
}

// /* TypeCheck */

// const el = document.createElement("div");

// createEventListenerMap(el, {
//   mouseenter: e => e.clientX,
//   touchend: e => e.touches,
//   // @ts-expect-error
//   keydown: e => e.clientX,
// });

// createEventListenerMap(el, {
//   keydown: e => e.key,
// });

// createEventListenerMap<{
//   test: Event;
//   custom: KeyboardEvent;
//   unused: Event;
// }>(el, {
//   test: e => e,
//   custom: e => e.key,
//   // @ts-expect-error
//   wrong: () => {},
// });
