import {
  access,
  accessAsArray,
  createCallbackStack,
  isClient,
  Many,
  MaybeAccessor
} from "@solid-primitives/utils";
import { createSignal } from "solid-js";
import { Accessor, createEffect, onCleanup } from "solid-js";
import { EventListenerDirectiveProps, EventMapOf, TargetWithEventMap } from "./types";

/**
 * Creates an event listener, that will be automatically disposed on cleanup.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param eventName - name of the handled event
 * @param handler - event handler
 * @param options - addEventListener options
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#createEventListener
 *
 * @example
 * createEventListener(element, 'click', e => { ... }, { passive: true })
 */

// DOM Events
export function createEventListener<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  EventName extends keyof EventMap
>(
  target: MaybeAccessor<Many<Target>>,
  eventName: MaybeAccessor<EventName>,
  handler: (event: EventMap[EventName]) => void,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): void;

// Custom Events
export function createEventListener<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<EventName>,
  handler: (event: EventMap[EventName]) => void,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): void;

export function createEventListener(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<string>,
  handler: (event: Event) => void,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): void {
  if (isClient) {
    const toCleanup = createCallbackStack();
    createEffect(() => {
      toCleanup.execute();
      const _eventName = access(eventName);
      const _options = access(options);
      accessAsArray(target).forEach(target => {
        if (!target) return;
        target.addEventListener(_eventName, handler, _options);
        toCleanup.push(() => target.removeEventListener(_eventName, handler, _options));
      });
    });
    onCleanup(toCleanup.execute);
  }
}

/**
 * Provides an reactive signal of last captured event.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param eventName - name of the handled event
 * @param options - addEventListener options
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#createEventSignal
 *
 * @example
 * const lastEvent = createEventSignal(el, 'click', { passive: true })
 */

// DOM Events
export function createEventSignal<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  EventName extends keyof EventMap
>(
  target: MaybeAccessor<Many<Target>>,
  eventName: MaybeAccessor<EventName>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Accessor<EventMap[EventName] | undefined>;

// Custom Events
export function createEventSignal<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<EventName>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Accessor<EventMap[EventName] | undefined>;

export function createEventSignal(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<string>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): Accessor<Event | undefined> {
  const [lastEvent, setLastEvent] = createSignal<Event>();
  createEventListener(target, eventName, setLastEvent, options);
  return lastEvent;
}

/**
 * Directive Usage. Creates an event listener, that will be automatically disposed on cleanup.
 *
 * @param props [eventName, eventHandler, options]
 *
 * @example
 * <button use:eventListener={["click", () => {...}]}>Click me!</button>
 */
export function eventListener(target: Element, props: Accessor<EventListenerDirectiveProps>): void {
  if (!target) return;
  const toCleanup = createCallbackStack();
  createEffect(() => {
    toCleanup.execute();
    const [eventName, handler, options] = props();
    target.addEventListener(eventName, handler, options);
    toCleanup.push(() => target.removeEventListener(eventName, handler, options));
  });
  onCleanup(toCleanup.execute);
}

// // /* TypeCheck */
// const mouseHandler = (e: MouseEvent) => {};
// const touchHandler = (e: TouchEvent) => {};
// const el = document.createElement("div");
// // dom events
// createEventListener(window, "mousemove", mouseHandler);
// createEventListener(document, "touchstart", touchHandler);
// createEventListener(el, "mousemove", mouseHandler);
// createEventListener(() => el, "touchstart", touchHandler);
// const mouseSignal = createEventSignal(window, "mousemove");
// const touchSignal = createEventSignal(() => document, "touchstart");
// // custom events
// createEventListener<{ test: MouseEvent }>(window, "test", mouseHandler);
// createEventListener<{ test: Event; custom: MouseEvent }, "custom">(
//   () => el,
//   "custom",
//   mouseHandler
// );
// createEventListener<{ test: Event }>(new EventTarget(), "test", () => console.log("test"));
// const testSignal = createEventSignal<{ test: MouseEvent }>(window, "test");
// const customSignal = createEventSignal<{ test: Event; custom: MouseEvent }, "custom">(
//   () => document,
//   "custom"
// );
// // directive
// eventListener(el, () => ["mousemove", mouseHandler, { passive: true }]);
// eventListener(el, () => ["custom", e => {}]);
