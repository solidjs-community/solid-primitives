import { accessAsArray, Fn, isClient, Many, MaybeAccessor } from "solid-fns";
import { Accessor, createEffect, JSX, onCleanup } from "solid-js";
export * from "./component";

export type EventMapOf<Target> = Target extends Window
  ? WindowEventMap
  : Target extends Document
  ? DocumentEventMap
  : Target extends HTMLElement
  ? HTMLElementEventMap
  : Target extends MediaQueryList
  ? MediaQueryListEventMap
  : never;

export type EventHandler<
  EventMap extends
    | HTMLElementEventMap
    | WindowEventMap
    | DocumentEventMap
    | MediaQueryListEventMap
    | Record<string, Event>,
  EventName extends keyof EventMap
> = (event: EventMap[EventName]) => void;

export type EventListenerReturn = [stop: Fn, start: Fn];

export type EventListenerDirectiveProps =
  | [string, (e: any) => void, boolean | AddEventListenerOptions]
  | [string, (e: any) => void];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // directive types are very premissive to prevent type errors from incompatible types, since props cannot be generic
      createEventListener: EventListenerDirectiveProps;
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

/**
 * Creates an event listener, that will be automatically disposed on cleanup.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param eventName - name of the handled event
 * @param handler - event handler
 * @param options - addEventListener options
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#readme
 *
 * @example
 * const [stop, start] = createEventListener(
 *   document.querySelector('.myEl'),
 *   'click',
 *   e => { ... }
 * )
 */

// DOM Events
export function createEventListener<
  Target extends Window | Document | HTMLElement | MediaQueryList,
  EventMap extends EventMapOf<Target>,
  EventName extends keyof EventMap
>(
  target: MaybeAccessor<Many<Target>>,
  eventName: EventName,
  handler: EventHandler<EventMap, EventName>,
  options?: boolean | AddEventListenerOptions
): EventListenerReturn;

// Custom Events
export function createEventListener<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap = keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: EventName,
  handler: EventHandler<EventMap, EventName>,
  options?: boolean | AddEventListenerOptions
): EventListenerReturn;

// Directive usage
export function createEventListener(
  target: MaybeAccessor<Many<EventTarget>>,
  props: Accessor<EventListenerDirectiveProps>
): EventListenerReturn;

export function createEventListener(
  target: MaybeAccessor<Many<EventTarget>>,
  ...rest: any
): EventListenerReturn {
  const getProps: Accessor<EventListenerDirectiveProps> = rest.length > 1 ? () => rest : rest[0];
  let toCleanup: Fn[] = [];

  const stop = () => {
    toCleanup.forEach(fn => fn());
    toCleanup = [];
  };
  const start = () => {
    if (!isClient) return;
    stop();
    const [eventName, handler, options] = getProps();
    accessAsArray(target).forEach(target => {
      if (!target) return;
      target.addEventListener(eventName, handler, options);
      toCleanup.push(() => target.removeEventListener(eventName, handler, options));
    });
  };

  createEffect(start);
  onCleanup(stop);

  return [stop, start];
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
// // custom events
// createEventListener<{ test: Event }>(window, "test", e => {});
// createEventListener<{ test: Event; custom: MouseEvent }, "custom">(
//   () => el,
//   "custom",
//   mouseHandler
// );
// createEventListener<{ test: Event }>(new EventTarget(), "test", () => console.log("test"));
// // directive
// createEventListener(el, () => ["mousemove", mouseHandler, { passive: true }]);
// createEventListener(el, () => ["custom", e => {}]);
