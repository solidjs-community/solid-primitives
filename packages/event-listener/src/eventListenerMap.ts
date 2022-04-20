import {
  Many,
  MaybeAccessor,
  createCallbackStack,
  forEachEntry,
  access
} from "@solid-primitives/utils";
import { Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { Store } from "solid-js/store";
import { createEventListener } from "./eventListener";
import {
  EventListenerMapDirectiveProps,
  EventMapOf,
  TargetWithEventMap,
  EventListenerOptions
} from "./types";

export type EventHandlersMap<EventMap> = {
  [EventName in keyof EventMap]: (event: EventMap[EventName]) => void;
};

export type EventListenerStoreReturns<E> = [lastEvents: Store<Partial<E>>, clear: VoidFunction];

/**
 * A helpful primitive that listens to a map of events. Handle them by individual callbacks.
 *
 * @param target accessor or variable of multiple or single event targets
 * @param handlersMap e.g. `{ mousemove: e => {}, click: e => {} }`
 * @param options e.g. `{ passive: true }`
 *
 * @returns Function clearing all event listeners form targets
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventListenerMap
 *
 * @example
 * const clear = createEventListenerMap(element, {
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
): VoidFunction;

// DOM Events
export function createEventListenerMap<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  HandlersMap extends Partial<EventHandlersMap<EventMap>>
>(
  target: MaybeAccessor<Many<Target>>,
  handlersMap: HandlersMap,
  options?: EventListenerOptions
): VoidFunction;

export function createEventListenerMap(
  targets: MaybeAccessor<Many<EventTarget>>,
  handlersMap: Record<string, any>,
  options?: EventListenerOptions
): VoidFunction {
  const { push, execute } = createCallbackStack();
  forEachEntry(access(handlersMap), (eventName, handler) => {
    push(createEventListener(targets, eventName, e => handler?.(e), options));
  });
  return execute;
}

/**
 * A helpful primitive that listens to target events and provides a reactive store with the latest captured events.
 *
 * @param target accessor or variable of multiple or single event targets
 * @param options e.g. `{ passive: true }` *(can be omitted)*
 * @param eventNames names of events you want to listen to, e.g. `"mousemove", "touchend", "click"`
 *
 * @returns reactive store with the latest captured events & clear function
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventStore
 *
 * @example
 * const [lastEvents, clear] = createEventStore(el, "mousemove", "touchend", "click");
 *
 * createEffect(() => {
 *   console.log(lastEvents.mousemove.x)
 * })
 */

// DOM Events - without options
export function createEventStore<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  UsedEvents extends keyof EventMap
>(
  target: MaybeAccessor<Many<Target>>,
  ...eventNames: UsedEvents[]
): EventListenerStoreReturns<Pick<EventMap, UsedEvents>>;

// DOM Events - with options
export function createEventStore<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  UsedEvents extends keyof EventMap
>(
  target: MaybeAccessor<Many<Target>>,
  options: EventListenerOptions,
  ...eventNames: UsedEvents[]
): EventListenerStoreReturns<Pick<EventMap, UsedEvents>>;

// Custom Events - without options
export function createEventStore<
  EventMap extends Record<string, Event>,
  UsedEvents extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  ...eventNames: UsedEvents[]
): EventListenerStoreReturns<Pick<EventMap, UsedEvents>>;

// Custom Events - with options
export function createEventStore<
  EventMap extends Record<string, Event>,
  UsedEvents extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  options: EventListenerOptions,
  ...eventNames: UsedEvents[]
): EventListenerStoreReturns<Pick<EventMap, UsedEvents>>;

export function createEventStore(
  targets: MaybeAccessor<Many<EventTarget>>,
  ...rest: any[]
): EventListenerStoreReturns<Record<string, Event>> {
  let options: EventListenerOptions | undefined = undefined;
  let names: string[];
  if (typeof rest[0] === "string") names = rest;
  else {
    const [_options, ..._events] = rest;
    options = _options;
    names = _events;
  }

  const store = {};
  const { push, execute } = createCallbackStack();
  names.forEach(type => {
    const [accessor, setter] = createSignal<Event>();
    Object.defineProperty(store, type, { get: accessor, set: setter, enumerable: true });
    push(createEventListener(targets, type, setter, options));
  });
  return [store, execute];
}

/**
 * Directive Usage. A helpful primitive that listens to provided events. Handle them by callbacks.
 *
 * @param props [handlerMap, options] | handlerMap
 * - **handlerMap**: e.g. `{ mousemove: e => {}, click: e => {} }`
 * - **options** e.g. `{ passive: true }`
 *
 * @example
 * <div use:eventListenerMap={{
 *    mousemove: e => {},
 *    click: clickHandler,
 *    touchstart: () => {}
 * }}></div>
 */
export function eventListenerMap(
  target: Element,
  getProps: Accessor<EventListenerMapDirectiveProps>
) {
  const toCleanup = createCallbackStack();
  createEffect(() => {
    toCleanup.execute();
    let handlersMap: Record<string, (e: Event) => void>;
    let options: boolean | undefined | AddEventListenerOptions;
    const props = getProps();
    if (Array.isArray(props)) {
      handlersMap = props[0];
      options = props[1];
    } else handlersMap = props;
    forEachEntry(handlersMap, (type, handler) => {
      target.addEventListener(type, handler, options);
      toCleanup.push(() => target.removeEventListener(type, handler, options));
    });
  });
  onCleanup(toCleanup.execute);
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
// const [lastEvents] = createEventStore(el, "mousemove", "touchend");
// lastEvents.touchend; // TouchEvent | undefined
// lastEvents.mousemove; // MouseEvent | undefined
// lastEvents.click; // ERROR

// createEventListenerMap<{
//   test: Event;
//   custom: MouseEvent;
//   unused: Event;
// }>(el, {
//   test: eventHandler,
//   custom: e => {}
// });
// const [lastEvents2] = createEventStore<{
//   test: Event;
//   custom: MouseEvent;
//   unused: Event;
// }>(el, "test", "custom");
// lastEvents2.custom; // MouseEvent | undefined
// lastEvents2.test; // Event | undefined
// lastEvents2.unused; // Event | undefined (we need to use the second generic to have proper types for the returned store)

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
// const [lastEvents3] = createEventStore<
//   {
//     test: Event;
//     custom: MouseEvent;
//     unused: Event;
//   },
//   "test" | "custom"
// >(el, "test", "custom");
// lastEvents3.custom; // MouseEvent | undefined
// lastEvents3.test; // Event | undefined
// lastEvents3.unused; // ERROR
