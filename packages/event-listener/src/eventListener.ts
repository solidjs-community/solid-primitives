import {
  createCallbackStack,
  Many,
  MaybeAccessor,
  forEach,
  Fn,
  isAccessor,
  onAccess,
  noop,
  access,
  isServer
} from "@solid-primitives/utils";
import { createSignal } from "solid-js";
import { Accessor, createEffect, onCleanup } from "solid-js";
import {
  ClearListeners,
  EventListenerDirectiveProps,
  EventMapOf,
  TargetWithEventMap,
  EventListenerOptions
} from "./types";

export type EventListenerSignalReturns<Event> = [
  lastEvent: Accessor<Event | undefined>,
  clear: ClearListeners
];

/**
 * Creates an event listener, that will be automatically disposed on cleanup.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param eventName - name of the handled event
 * @param handler - event handler
 * @param options - addEventListener options
 *
 * @returns Function clearing all event listeners form targets
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#createEventListener
 *
 * @example
 * const clear = createEventListener(element, 'click', e => { ... }, { passive: true })
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
  options?: MaybeAccessor<EventListenerOptions>
): ClearListeners;

// Custom Events
export function createEventListener<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<EventName>,
  handler: (event: EventMap[EventName]) => void,
  options?: MaybeAccessor<EventListenerOptions>
): ClearListeners;

export function createEventListener(
  targets: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<string>,
  handler: (event: Event) => void,
  options?: MaybeAccessor<EventListenerOptions>
): ClearListeners {
  if (isServer) return noop;
  const cleanup = createCallbackStack();

  const attachListeners = (
    targets: Many<EventTarget>,
    eventName: string,
    options?: EventListenerOptions
  ) => {
    cleanup.execute();
    forEach(targets, el => {
      if (!el) return;
      el.addEventListener(eventName, handler, options);
      cleanup.push(() => el.removeEventListener(eventName, handler, options));
    });
  };

  if (isAccessor(targets)) {
    // if the target is an accessor the listeners will be added on the first effect (onMount)
    // so that when passed a jsx ref it will be availabe
    createEffect(onAccess([targets, eventName, options], a => attachListeners(...a)));
  } else {
    // if the target prop is NOT an accessor, the event listeners can be added right away
    attachListeners(targets, access(eventName), access(options));
    createEffect(
      onAccess([eventName, options], a => attachListeners(targets, ...a), { defer: true })
    );
  }

  onCleanup(cleanup.execute);
  return cleanup.execute;
}

// Possible targets prop shapes:
// el
// () => el
// [el, el]
// () => [el, el]

/**
 * Provides an reactive signal of last captured event.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param eventName - name of the handled event
 * @param options - addEventListener options
 *
 * @returns Signal of last captured event & function clearing all event listeners
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#createEventSignal
 *
 * @example
 * const lastEvent = createEventSignal(el, 'click', { passive: true })
 *
 * createEffect(() => {
 *    console.log(lastEvent())
 * })
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
): EventListenerSignalReturns<EventMap[EventName]>;

// Custom Events
export function createEventSignal<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<EventName>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): EventListenerSignalReturns<EventMap[EventName]>;

export function createEventSignal(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<string>,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): [Accessor<Event | undefined>, Fn] {
  const [lastEvent, setLastEvent] = createSignal<Event>();
  const clear = createEventListener(target, eventName, setLastEvent, options);
  return [lastEvent, clear];
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
