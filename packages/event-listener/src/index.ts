import { Accessor, createEffect, onCleanup } from "solid-js";
import type { JSX } from "solid-js";

// because of a generic eventName, this needs to be used for type casting addEventListener arguments
type ValidAddEventListenerProps = [
  type: string,
  callback: EventListenerOrEventListenerObject | null,
  options?: boolean | AddEventListenerOptions
];

export type EventHandler<
  E extends WindowEventMap | Record<string, Event> = WindowEventMap,
  K extends keyof E = keyof E
> = (event: E[K]) => void;

export type EventListenerProps<
  E extends WindowEventMap | Record<string, Event> = WindowEventMap,
  K extends keyof E = keyof E
> = [name: K, handler: EventHandler<E, K> | null, options?: boolean | AddEventListenerOptions];

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      createEventListener: (
        ref: HTMLElement,
        props: Accessor<EventListenerProps>
      ) => [add: (target: EventTarget) => void, remove: (target: EventTarget) => void];
    }
  }
}

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;

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
 *
 * // or as a directive
 * <MyButton use:createEventListener={() => ['click', () => console.log("Click")]}>Click!</MyButton>
 *
 * // you can provide your own event map type:
 * createEventListener<{ myCustomEvent: Event }>(window, 'myCustomEvent', () => console.log("yup!"));
 * ```
 */
export function createEventListener<
  E extends WindowEventMap | Record<string, Event> = WindowEventMap,
  K extends keyof E = keyof E
>(
  target: EventTarget | EventTarget[],
  eventName: K,
  handler: EventHandler<E, K> | null,
  options?: boolean | AddEventListenerOptions
): readonly [add: (el: EventTarget) => void, remove: (el: EventTarget) => void];

export function createEventListener<
  E extends WindowEventMap | Record<string, Event> = WindowEventMap,
  K extends keyof E = keyof E
>(
  ref: EventTarget | EventTarget[],
  props: Accessor<EventListenerProps<E, K>>
): readonly [add: (el: EventTarget) => void, remove: (el: EventTarget) => void];

export function createEventListener<
  E extends WindowEventMap | Record<string, Event> = WindowEventMap,
  K extends keyof E = keyof E
>(
  target: EventTarget | EventTarget[],
  nameOrProps: K | Accessor<EventListenerProps<E, K>>,
  handler?: EventHandler<E, K> | null,
  options?: boolean | AddEventListenerOptions
): readonly [add: (el: EventTarget) => void, remove: (el: EventTarget) => void] {
  const targets = Array.isArray(target) ? target : [target];
  const props: Accessor<EventListenerProps<E, K>> =
    typeof nameOrProps === "function"
      ? nameOrProps
      : () => [nameOrProps ?? "", handler ?? null, options];
  const add = (target: EventTarget) => {
    targets.includes(target) || targets.push(target);
    target.addEventListener.apply(target, props() as ValidAddEventListenerProps);
  };
  const remove = (target: EventTarget) => {
    targets.forEach((t, index) => t === target && targets.splice(index, 1));
    target.removeEventListener.apply(target, props() as ValidAddEventListenerProps);
  };
  // we need to directly add the event, otherwise we cannot dispatch it before the next effect runs
  targets.forEach(add);
  createEffect((previousProps?: EventListenerProps<E, K>) => {
    const currentProps = props();
    if (previousProps !== currentProps) {
      previousProps &&
        targets.forEach(target =>
          target.removeEventListener.apply(target, previousProps as ValidAddEventListenerProps)
        );
      targets.forEach(add);
    }
    return currentProps;
  }, props());
  onCleanup(() => {
    targets.forEach(remove);
  });
  return [add, remove];
}

export default createEventListener;
