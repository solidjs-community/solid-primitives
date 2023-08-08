import {
  Many,
  MaybeAccessor,
  access,
  asArray,
  Directive,
  tryOnCleanup,
} from "@solid-primitives/utils";
import { Accessor, createEffect, createRenderEffect, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import {
  EventListenerDirectiveProps,
  EventMapOf,
  TargetWithEventMap,
  EventListenerOptions,
} from "./types.js";

/**
 * Creates an event listener, that will be automatically disposed on cleanup.
 * @param target - ref to HTMLElement, EventTarget
 * @param type - name of the handled event
 * @param handler - event handler
 * @param options - addEventListener options
 * @returns Function clearing all event listeners form targets
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#makeEventListener
 * @example
 * const clear = makeEventListener(element, 'click', e => { ... }, { passive: true })
 * // remove listener (will also happen on cleanup)
 * clear()
 */

// DOM Events
export function makeEventListener<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  EventType extends keyof EventMap,
>(
  target: Target,
  type: EventType,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): VoidFunction;

// Custom Events
export function makeEventListener<
  EventMap extends Record<string, Event>,
  EventType extends keyof EventMap = keyof EventMap,
>(
  target: EventTarget,
  type: EventType,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): VoidFunction;

export function makeEventListener(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options?: EventListenerOptions,
): VoidFunction {
  target.addEventListener(type, handler, options);
  return tryOnCleanup(target.removeEventListener.bind(target, type, handler, options));
}

/**
 * Creates a reactive event listener, that will be automatically disposed on cleanup,
 * and can take reactive arguments to attach listeners to new targets once changed.
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param type - name of the handled event
 * @param handler - event handler
 * @param options - addEventListener options
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventListener
 * @example
 * const [targets, setTargets] = createSignal([element])
 * createEventListener(targets, 'click', e => { ... }, { passive: true })
 * setTargets([]) // <- removes listeners from previous target
 * setTargets([element, button]) // <- adds listeners to new targets
 */

// DOM Events
export function createEventListener<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>,
  EventType extends keyof EventMap,
>(
  target: MaybeAccessor<Many<Target | undefined>>,
  type: MaybeAccessor<Many<EventType>>,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): void;

// Custom Events
export function createEventListener<
  EventMap extends Record<string, Event>,
  EventType extends keyof EventMap = keyof EventMap,
>(
  target: MaybeAccessor<Many<EventTarget | undefined>>,
  type: MaybeAccessor<Many<EventType>>,
  handler: (event: EventMap[EventType]) => void,
  options?: EventListenerOptions,
): void;

export function createEventListener(
  targets: MaybeAccessor<Many<EventTarget | undefined>>,
  type: MaybeAccessor<Many<string>>,
  handler: (event: Event) => void,
  options?: EventListenerOptions,
): void {
  if (isServer) return;

  const attachListeners = () => {
    asArray(access(targets)).forEach(el => {
      if (el) asArray(access(type)).forEach(type => makeEventListener(el, type, handler, options));
    });
  };

  // if the target is an accessor the listeners will be added on the first effect (onMount)
  // so that when passed a jsx ref it will be availabe
  if (typeof targets === "function") createEffect(attachListeners);
  // if the target prop is NOT an accessor, the event listeners can be added right away
  else createRenderEffect(attachListeners);
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
 * @param type - name of the handled event
 * @param options - addEventListener options
 *
 * @returns Signal of last captured event & function clearing all event listeners
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventSignal
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
  EventType extends keyof EventMap,
>(
  target: MaybeAccessor<Many<Target>>,
  type: MaybeAccessor<Many<EventType>>,
  options?: EventListenerOptions,
): Accessor<EventMap[EventType]>;

// Custom Events
export function createEventSignal<
  EventMap extends Record<string, Event>,
  EventType extends keyof EventMap = keyof EventMap,
>(
  target: MaybeAccessor<Many<EventTarget>>,
  type: MaybeAccessor<Many<EventType>>,
  options?: EventListenerOptions,
): Accessor<EventMap[EventType]>;

export function createEventSignal(
  target: MaybeAccessor<Many<EventTarget>>,
  type: MaybeAccessor<Many<string>>,
  options?: EventListenerOptions,
): Accessor<Event | undefined> {
  if (isServer) {
    return () => undefined;
  }
  const [lastEvent, setLastEvent] = createSignal<Event>();
  createEventListener(target, type, setLastEvent, options);
  return lastEvent;
}

/**
 * Directive Usage. Creates an event listener, that will be automatically disposed on cleanup.
 *
 * @param props [eventType, handler, options]
 *
 * @example
 * <button use:eventListener={["click", () => {...}]}>Click me!</button>
 */
export const eventListener: Directive<EventListenerDirectiveProps> = (target, props) => {
  createEffect(() => {
    const [type, handler, options] = props();
    makeEventListener(target, type, handler, options);
  });
};

// // /* TypeCheck */
// const mouseHandler = (e: MouseEvent) => {};
// const touchHandler = (e: TouchEvent) => {};
// const el = document.createElement("div");
// // dom events
// createEventListener(window as Window | undefined, "mousemove", mouseHandler);
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
