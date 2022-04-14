import { createProxy, isClient, Many, MaybeAccessor } from "@solid-primitives/utils";
import { createEventListener } from "./eventListener";
import { runWithSubRoot } from "@solid-primitives/rootless";
import { EventMapOf, TargetWithEventMap, EventListenerOptions } from "./types";
import { getOwner } from "solid-js";

export type EventListenerBus<EventMap extends Record<string, any>> = Readonly<
  {
    [K in `on${keyof EventMap extends string ? keyof EventMap : never}`]: (
      handler: (event: EventMap[K extends `on${infer T}` ? T : never]) => void
    ) => VoidFunction;
  } & {
    on: <T extends keyof EventMap>(
      type: MaybeAccessor<Many<T>>,
      handler: (event: EventMap[T]) => void
    ) => VoidFunction;
  }
>;

// owner option:
// use initial = true
// set custom = Owner | null
// without = false (default)

/**
 * Dynamically add and remove event listeners to an event target. The listeners will be automatically removed on cleanup.
 * @param target the event target, could be a `window`, `document`, `HTMLElement` or `MediaQueryList`. *Defaults to `window`*
 * @param options event listener options, such as `passive` or `capture`
 * @returns a Proxy object, which lets you create event listeners by calling appropriate property
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#createEventListenerBus
 * @example
 * const bus = createEventListenerBus(document.body);
 * bus.onpointerenter(e => {...});
 * // listeners return a function that removes them
 * const clear = bus.onpointermove(e => {...});
 * clear();
 * // or pass event type as an argument
 * const unsub = bus.on('click', e => {...})
 */

// Target not specified
export function createEventListenerBus(
  target?: undefined,
  options?: EventListenerOptions
): EventListenerBus<WindowEventMap>;
// DOM Events
export function createEventListenerBus<Target extends TargetWithEventMap>(
  target: MaybeAccessor<Many<Target>>,
  options?: EventListenerOptions
): EventListenerBus<EventMapOf<Target>>;
// Custom Events
export function createEventListenerBus<EventMap extends Record<string, Event>>(
  target?: MaybeAccessor<Many<EventTarget>>,
  options?: EventListenerOptions
): EventListenerBus<EventMap>;
export function createEventListenerBus(
  target: MaybeAccessor<Many<EventTarget>> = isClient ? window : [],
  options: EventListenerOptions = {}
) {
  const owner = getOwner();
  const addListener = (type: MaybeAccessor<Many<string>>, handler: (v: any) => void) =>
    runWithSubRoot(
      () => {
        createEventListener(target, type, handler, options);
      },
      owner,
      getOwner()
    );
  return createProxy<Record<string, (a: any, b: any) => VoidFunction>>({
    get:
      key =>
      (...args) =>
        args.length === 2 ? addListener(...args) : addListener(key.substring(2), args[0])
  });
}

// const bus = createEventListenerBus(undefined, { capture: true });
// bus.onpointerenter(e => {});
// const unsub = bus.onpointermove(e => {});
// unsub();
// const clear = bus.on(
//   () => ["mousemove", "mousedown"],
//   e => {}
// );

// type SomeEvent = Event & { _: "" };
// type MyEvent = Event & { _: "" };
// const bus = createEventListenerBus<{
//   foo: SomeEvent;
//   bar: MyEvent;
// }>();
// bus.onfoo(e => {});
// bus.onbar(e => {});
