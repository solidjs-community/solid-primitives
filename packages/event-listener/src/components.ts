import { isServer } from "solid-js/web";
import { keys } from "@solid-primitives/utils";
import { type Component } from "solid-js";
import { makeEventListener } from "./eventListener.js";

export type WindowEventProps = {
  [K in keyof WindowEventMap as `on${Capitalize<K>}` | `on${K}`]?: (
    event: WindowEventMap[K],
  ) => void;
};
export type DocumentEventProps = {
  [K in keyof DocumentEventMap as `on${Capitalize<K>}` | `on${K}`]?: (
    event: DocumentEventMap[K],
  ) => void;
};

const attachPropListeners = (
  target: typeof window | typeof document,
  props: WindowEventProps | DocumentEventProps,
) => {
  keys(props).forEach(attr => {
    if (attr.startsWith("on") && typeof props[attr] === "function")
      makeEventListener(target, attr.substring(2).toLowerCase(), props[attr] as any);
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
export const WindowEventListener: Component<WindowEventProps> = props => {
  if (isServer) return null;
  attachPropListeners(window, props);
};

/**
 * Listen to the `document` DOM Events, using a component.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/event-listener#DocumentEventListener
 *
 * @example
 * <DocumentEventListener onMouseMove={e => console.log(e.x, e.y)} />
 */
export const DocumentEventListener: Component<DocumentEventProps> = props => {
  if (isServer) return null;
  attachPropListeners(document, props);
};
