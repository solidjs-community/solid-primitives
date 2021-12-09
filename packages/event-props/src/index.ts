import { createSignal } from "solid-js";

export type HTMLEventName = keyof HTMLElementEventMap
export type EventNames = [name: HTMLEventName, ...moreNames: HTMLEventName[]];
export type EventStore<Names extends HTMLEventName[]> = {
  [name in Names[number]]?: HTMLElementEventMap[name]
};
export type EventProps<Names extends EventNames> = {
  [name in Names[number] as `on${name}`]: (ev: HTMLElementEventMap[name]) => void
};

/**
 * Creates the props for certain events for an intrinsic JSX element and a store with the received events
 * @param names of the events that should be available in props and store
 * @returns [eventStore, eventProps]
 * @example
 * ```ts
 * const [events, eventProps] = createEventProps('mousedown', 'mousemove', 'mouseup');
 * 
 * const isMouseDown = createMemo(() => (events.mousedown?.ts ?? 0) > (events.mouseup?.ts ?? 1));
 * 
 * createEffect(() => {
 *   if (isMouseDown) {
 *     console.log(events.mousemove?.clientX, events.mousemove?.clientY);
 *   }
 * });
 * 
 * <div {...eventProps}>Click and drag on me</div>
 * ```
 */
export const createEventProps = <Names extends EventNames>(
  ...names: Names
): [EventStore<Names>, EventProps<Names>] => {
  const store: EventStore<Names> = {};
  const eventProps: Record<string, (ev: Event) => void> = {};
  names.forEach((name) => {
    const [accessor, setter] = createSignal<HTMLElementEventMap[typeof name]>();
    Object.defineProperty(store, name, { get: accessor, set: setter, enumerable: true });
    eventProps[`on${name}` as `on${Names[number]}`] = setter;
  });
  return [store, (eventProps as unknown) as EventProps<Names>];
};
