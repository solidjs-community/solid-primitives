import { Accessor, JSX } from "solid-js";
import { MaybeAccessor, Directive, createHydrateSignal } from "@solid-primitives/utils";
import { makeEventListener, createEventListener } from "@solid-primitives/event-listener";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      focus: (isActive: boolean) => void;
    }
  }
}
// This ensures the `JSX` import won't fall victim to tree shaking
export type E = JSX.Element;

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
  callback: (element: Element | null) => void
): VoidFunction {
  if (process.env.SSR) {
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
  if (process.env.SSR) {
    return () => null;
  }
  const [active, setActive] = createHydrateSignal<Element | null>(null, getActiveElement);
  makeActiveElementListener(setActive);
  return active;
}

/**
 * Attaches "blur" and "focus" event listeners to the element.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#makeFocusListener
 * @param target element
 * @param callback handle focus change
 * @param useCapture activates capturing, which allows to listen on events at the root that don't support bubbling.
 * @returns function for clearing event listeners
 * @example
 * const [isFocused, setIsFocused] = createSignal(false)
 * const clear = makeFocusListener(focused => setIsFocused(focused));
 * // remove listeners (happens also on cleanup)
 * clear();
 */
export function makeFocusListener(
  target: Element,
  callback: (isActive: boolean) => void,
  useCapture = true
): VoidFunction {
  if (process.env.SSR) {
    return () => void 0;
  }
  const clear1 = makeEventListener(target, "blur", callback.bind(void 0, false), useCapture);
  const clear2 = makeEventListener(target, "focus", callback.bind(void 0, true), useCapture);
  return () => (clear1(), clear2());
}

/**
 * Provides a signal representing element's focus state.
 * @param target element or a reactive function returning one
 * @returns boolean signal representing element's focus state
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/active-element#createFocusSignal
 * @example
 * const isFocused = createFocusSignal(() => el)
 * isFocused() // T: boolean
 */
export function createFocusSignal(target: MaybeAccessor<Element>): Accessor<boolean> {
  if (process.env.SSR) {
    return () => false;
  }
  const [isActive, setIsActive] = createHydrateSignal(
    false,
    () => document.activeElement === target
  );
  createEventListener(target, "blur", () => setIsActive(false), true);
  createEventListener(target, "focus", () => setIsActive(true), true);
  return isActive;
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
  if (process.env.SSR) {
    return;
  }
  const callback = props();
  callback(document.activeElement === target);
  makeFocusListener(target, callback);
};
