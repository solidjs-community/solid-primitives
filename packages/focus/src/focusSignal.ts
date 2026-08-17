import { type Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { type MaybeAccessor, createHydratableSignal } from "@solid-primitives/utils";
import { makeEventListener, createEventListener } from "@solid-primitives/event-listener";

/**
 * Attaches "blur" and "focus" event listeners to the element.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/focus#makeFocusListener
 * @param target element
 * @param callback handle focus change
 * @param useCapture activates capturing, which allows to listen on events at the root that don't support bubbling.
 * @returns function for clearing event listeners
 * @example
 * const [isFocused, setIsFocused] = createSignal(false)
 * const clear = makeFocusListener(el, focused => setIsFocused(focused));
 * // remove listeners (happens also on cleanup)
 * clear();
 */
export function makeFocusListener(
  target: Element,
  callback: (isActive: boolean) => void,
  useCapture = true,
): VoidFunction {
  if (isServer) {
    return () => {};
  }
  const clear1 = makeEventListener(target, "blur", callback.bind(undefined, false), useCapture);
  const clear2 = makeEventListener(target, "focus", callback.bind(undefined, true), useCapture);
  return () => (clear1(), clear2());
}

/**
 * Provides a signal representing element's focus state.
 * @param target element or a reactive function returning one
 * @returns boolean signal representing element's focus state
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/focus#createFocusSignal
 * @example
 * const isFocused = createFocusSignal(() => el)
 * isFocused() // T: boolean
 */
export function createFocusSignal(target: MaybeAccessor<Element>): Accessor<boolean> {
  if (isServer) {
    return () => false;
  }
  const [isActive, setIsActive] = createHydratableSignal(
    false,
    () => document.activeElement === target,
  );
  createEventListener(target, "blur", () => setIsActive(false), true);
  createEventListener(target, "focus", () => setIsActive(true), true);
  return isActive;
}
