import { isClient } from "solid-fns";
import { Component, JSX } from "solid-js";
import { createEventListener } from ".";

type HTMLEventAttributes<T> = {
  [K in keyof JSX.HTMLAttributes<T>]: `${K}` extends `on${string}`
    ? JSX.HTMLAttributes<T>[K]
    : never;
};

/**
 * Listen to the `window` Events.
 */
export const GlobalEventListener: Component<HTMLEventAttributes<Window>> = props => {
  if (isClient) {
    const modifyHandler = (handler: (e: Event) => void) => (e: Event) => {
      // JSX Event Attributes have modify the event's "currentTarget"
      Object.defineProperty(e, "currentTarget", {
        get: () => window
      });
      handler(e);
    };
    Object.keys(props).forEach(attr => {
      if (!attr.startsWith("on")) return;
      const eventName = attr.substring(2).toLowerCase();
      createEventListener(window, () => [eventName, modifyHandler((props as any)[attr])]);
    });
  }
  return undefined;
};
