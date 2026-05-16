import { type Accessor, type JSX } from "solid-js";
import { isServer } from "@solidjs/web";
import { type Directive, createHydratableSignal } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      focus: (isActive: boolean) => void;
    }
  }
}
// This ensures the `JSX` import won't fall victim to tree shaking
export type E = JSX.Directives;

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
 * A directive that notifies you when the element becomes active or inactive.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#focus
 *
 * @example
 * const [active, setActive] = createSignal(false)
 * <input use:focus={setActive} />
 */
export const focus: Directive<(isActive: boolean) => void> = (target, props) => {
  if (isServer) {
    return;
  }
  const callback = props();
  callback(document.activeElement === target);
  makeEventListener(target, "blur", callback.bind(void 0, false), true);
  makeEventListener(target, "focus", callback.bind(void 0, true), true);
};
