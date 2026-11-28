import { type Accessor, getOwner, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { createHydratableSignal } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";

const getActiveElement = () =>
  document.activeElement === document.body ? null : document.activeElement;

/**
 * Attaches event listeners to window, listening for the changes of the `document.activeElement`.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#makeActiveElementListener
 * @param callback handle active element change
 * @returns function to clear event listeners
 * @example
 * const [activeElement, setActiveElement] = createSignal(null);
 * const clear = makeActiveElementListener(el => setActiveElement(el));
 * // remove listeners (happens also on cleanup)
 * clear();
 */
export function makeActiveElementListener(
  callback: (element: Element | null) => void,
): VoidFunction {
  if (isServer) {
    return () => void 0;
  }
  const handleChange = () => callback(getActiveElement());
  const clear1 = makeEventListener(window, "blur", handleChange, true);
  const clear2 = makeEventListener(window, "focus", handleChange, true);
  return () => (clear1(), clear2());
}

/**
 * Provides reactive signal of `document.activeElement`. Check which element is currently focused.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#createActiveElement
 * @example
 * const activeEl = createActiveElement()
 * activeEl() // T: Element | null
 */
export function createActiveElement(): Accessor<Element | null> {
  if (isServer) {
    return () => null;
  }
  const [active, setActive] = createHydratableSignal<Element | null>(null, getActiveElement);
  makeActiveElementListener(setActive);
  return active;
}

/**
 * A ref factory that notifies you when the element becomes active or inactive.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#focus
 *
 * @example
 * const [active, setActive] = createSignal(false)
 * <input ref={focus(setActive)} />
 */
export function focus(callback: (isActive: boolean) => void): (target: Element) => VoidFunction {
  if (isServer) return () => () => {};
  // One teardown per element, so a single focus() value can be attached to several elements.
  const teardowns = new Set<VoidFunction>();
  // The runtime ignores a ref callback's return value, so the factory owner tears down too.
  if (getOwner()) onCleanup(() => [...teardowns].forEach(t => t()));
  return (target: Element) => {
    callback(document.activeElement === target);
    const onBlur = () => callback(false);
    const onFocus = () => callback(true);
    target.addEventListener("blur", onBlur, true);
    target.addEventListener("focus", onFocus, true);
    const teardown = () => {
      target.removeEventListener("blur", onBlur, true);
      target.removeEventListener("focus", onFocus, true);
      teardowns.delete(teardown);
    };
    teardowns.add(teardown);
    return teardown;
  };
}
