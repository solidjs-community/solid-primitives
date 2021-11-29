import { Accessor, createEffect, onCleanup } from "solid-js";
import type { JSX } from "solid-js";

export type EventMapOf<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : T extends HTMLElement
  ? HTMLElementEventMap
  : T extends MediaQueryList
  ? MediaQueryListEventMap
  : {};

export type EventMapOfMultiple<T> = T extends EventTarget
  ? EventMapOf<T>
  : T extends EventTarget[]
  ? EventMapOf<T[number]>
  : never;

export type EventListenerProps<
  T extends EventTarget | EventTarget[],
  E extends Record<string, Event> = {}
> = [
  name: [{}, {}] extends [EventMapOfMultiple<T>, E]
    ? string
    : string & (keyof EventMapOfMultiple<T> | keyof E),
  handler: EventListenerOrEventListenerObject | null,
  options?: AddEventListenerOptions
];

export type CreateEventListenerReturn = [
  add: (el: EventTarget) => void,
  remove: (el: EventTarget) => void
];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      createEventListener: (
        ref: HTMLElement,
        props: Accessor<EventListenerProps<HTMLElement, {}>>
      ) => [add: (target: EventTarget) => void, remove: (target: EventTarget) => void];
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

type CreateEventListenerFn = <
  EventMap extends Record<string, Event>,
  Target extends EventTarget | EventTarget[]
>(
  target: Target,
  ...props: [Accessor<EventListenerProps<Target, EventMap>>] | EventListenerProps<Target, EventMap>
) => CreateEventListenerReturn;

/**
 * Creates an event listener helper primitive.
 *
 * @param target - ref to HTMLElement, EventTarget or Array thereof
 * @param nameOrProps - name of the event or Accessor with the event props ([name, handler, options?])
 * @param handler - if nameOrProps contains a name, you can specify the handler here
 * @param options - if nameOrProps contains a name, you can specify event listener options
 *
 * @example
 * ```tsx
 * const [add, remove] = createEventListener(
 *   document.getElementById("mybutton"),
 *   "mouseDown",
 *   () => console.log("Click")
 * );
 * // or as a directive
 * <MyButton use:createEventListener={() => ['click', () => console.log("Click")]}>Click!</MyButton>
 * // you can provide your own event map type:
 * createEventListener<{ myCustomEvent: Event }, Window>(window, 'myCustomEvent', () => console.log("yup!"));
 * ```
 */
export const createEventListener: CreateEventListenerFn = (target, ...propsArray) => {
  const targets: EventTarget[] = Array.isArray(target) ? target : [target];
  type EventProps = [
    name: string,
    handler: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions
  ];
  const props: Accessor<EventProps> =
    typeof propsArray[0] === "function"
      ? propsArray[0]
      : () => propsArray as EventProps;
  const add = (target: EventTarget) => {
    targets.includes(target) || targets.push(target);
    const [name, handler, options] = props();
    if (name && handler !== undefined) {
      target.addEventListener.apply(target, props());
    }
  };
  const remove = (target: EventTarget) => {
    targets.forEach((t, index) => t === target && targets.splice(index, 1));
    target.removeEventListener.apply(target, props());
  };
  // we need to directly add the event, otherwise we cannot dispatch it before the next effect runs
  targets.forEach(add);
  createEffect(previousProps => {
    const currentProps = props();
    if (previousProps !== currentProps) {
      previousProps &&
        targets.forEach(target => target.removeEventListener.apply(target, previousProps));
      targets.forEach(add);
    }
    return currentProps;
  }, props());
  onCleanup(() => {
    targets.forEach(remove);
  });
  return [add, remove];
};

export default createEventListener;

// /* TypeCheck */
// wrong event names:
// createEventListener<{}, Document>(document, () => ['fullscreenchenge', () => console.log('test')]);
// createEventListener<{}, Window>(window, 'fullscreenchange', () => console.log('test'));
// valid events:
// createEventListener<{}, Document>(document, () => ['fullscreenchange', () => console.log('test')]);
// createEventListener<{}, Document>(document, () => ['abort', () => console.log('test')]);
// createEventListener<{}, Window>(window, 'abort', () => console.log('test'));
// createEventListener<{test: Event}, Window>(window, 'scroll', () => console.log('test'))
// createEventListener<{test: Event}, EventTarget>(new EventTarget(), 'test', () => console.log('test'));
// /**/
