import { isClient } from "@solid-primitives/utils";
import { Component, JSX } from "solid-js";
import { createEventListener } from ".";

type EventAttributes<T> = {
  [K in keyof JSX.DOMAttributes<T>]: `${K}` extends `on${string}` ? JSX.DOMAttributes<T>[K] : never;
};

/**
 * Listen to the `window` DOM Events, using a component.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/event-listener#GlobalEventListener
 *
 * @example
 * <GlobalEventListener onMouseMove={e => console.log(e.x, e.y)} />
 */
export const GlobalEventListener: Component<EventAttributes<null>> = props => {
  if (isClient) {
    Object.keys(props).forEach(attr => {
      if (!attr.startsWith("on")) return;
      const eventName = attr.substring(2).toLowerCase();
      createEventListener(window, () => [eventName, (props as any)[attr]]);
    });
  }
  return undefined;
};
