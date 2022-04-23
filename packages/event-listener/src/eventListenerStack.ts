import { createCallbackStack } from "@solid-primitives/utils";
import { onCleanup } from "solid-js";
import { newEventListener } from "./eventListener";
import { EventMapOf, TargetWithEventMap, EventListenerOptions } from "./types";

export type EventListenerStackOn<EventMap extends Record<string, any>> = {
  <T extends keyof EventMap>(
    type: T,
    handler: (event: EventMap[T]) => void,
    options?: EventListenerOptions
  ): VoidFunction;
};

/**
 * Creates a stack of event listeners, that will be automatically disposed on cleanup.
 * @param target - ref to HTMLElement, EventTarget
 * @param options - addEventListener options
 * @returns Function clearing all event listeners form targets
 * @example
 * const [listen, clear] = newEventListenerStack(target, { passive: true });
 * listen("mousemove", handleMouse);
 * listen("dragover", handleMouse);
 * // remove listener (will also happen on cleanup)
 * clear()
 */

// DOM Events
export function newEventListenerStack<
  Target extends TargetWithEventMap,
  EventMap extends EventMapOf<Target>
>(
  target: Target,
  options?: EventListenerOptions
): [listen: EventListenerStackOn<EventMap>, clear: VoidFunction];

// Custom Events
export function newEventListenerStack<EventMap extends Record<string, Event>>(
  target: EventTarget,
  options?: EventListenerOptions
): [listen: EventListenerStackOn<EventMap>, clear: VoidFunction];

export function newEventListenerStack(
  target: EventTarget,
  options?: EventListenerOptions
): [listen: EventListenerStackOn<Record<string, Event>>, clear: VoidFunction] {
  const { push, execute } = createCallbackStack();
  return [
    (type, handler, overwriteOptions) => {
      const clear = newEventListener(target, type, handler, overwriteOptions ?? options);
      push(clear);
      return clear;
    },
    onCleanup(execute)
  ];
}
