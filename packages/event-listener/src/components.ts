import { isClient } from "@solid-primitives/utils";
import { Component, JSX } from "solid-js";
import { createEventListener } from ".";

type EventAttributes<T> = {
  [K in keyof JSX.DOMAttributes<T>]: `${K}` extends `on${string}` ? JSX.DOMAttributes<T>[K] : never;
};

const forEachEventAttr = (
  props: EventAttributes<null>,
  fn: (eventName: string, attr: string) => void
) => {
  Object.keys(props).forEach(attr => {
    if (!attr.startsWith("on")) return;
    const eventName = attr.substring(2).toLowerCase();
    fn(eventName, attr);
  });
};

/**
 * Listen to the `window` DOM Events, using a component.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#WindowEventListener
 *
 * @example
 * <WindowEventListener onMouseMove={e => console.log(e.x, e.y)} />
 */
export const WindowEventListener: Component<EventAttributes<null>> = props => {
  if (isClient)
    forEachEventAttr(props, (type, attr) => {
      createEventListener(window, type, e => (props as any)[attr](e));
    });
  return undefined;
};

/**
 * Listen to the `document` DOM Events, using a component.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#DocumentEventListener
 *
 * @example
 * <DocumentEventListener onMouseMove={e => console.log(e.x, e.y)} />
 */
export const DocumentEventListener: Component<EventAttributes<null>> = props => {
  if (isClient)
    forEachEventAttr(props, (eventName, attr) => {
      createEventListener(document, eventName, e => (props as any)[attr](e));
    });
  return undefined;
};
