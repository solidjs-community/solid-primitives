import { access, Fn, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createComputed, createEffect, createSignal, JSX, onCleanup } from "solid-js";

export type IsElementActiveProps = (isActive: boolean) => void;
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      isElementActive: IsElementActiveProps;
    }
  }
}
// This ensures the `JSX` import won't fall victim to tree shaking
export type E = JSX.Element;

/**
 * A reactive `document.activeElement`. Check which element is currently focused.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/active-element#createActiveElement
 * @example
 * const [activeEl, { stop, start }] = createActiveElement()
 */
export function createActiveElement(): [
  getter: Accessor<null | Element>,
  actions: { stop: Fn; start: Fn }
] {
  const [active, setActive] = createSignal<Element | null>(null);
  const handleChange = () => setActive(window.document.activeElement);

  let stop: Fn = () => {};
  const start = () => {
    stop();
    handleChange();
    window.addEventListener("blur", handleChange, true);
    window.addEventListener("focus", handleChange, true);
    stop = () => {
      window.removeEventListener("blur", handleChange, true);
      window.removeEventListener("focus", handleChange, true);
      stop = () => {};
    };
  };
  start();
  onCleanup(() => stop());

  return [
    active,
    {
      stop,
      start
    }
  ];
}

/**
 * Pass in an element, and see if it's focused.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/active-element#createIsElementActive
 * @example
 * const [isFocused, { stop, start }] = createIsElementActive(() => el)
 */
export function createIsElementActive(
  target: MaybeAccessor<Element>
): [getter: Accessor<boolean>, actions: { stop: Fn; start: Fn }] {
  const [isActive, setIsActive] = createSignal(false);
  const handleFocus = () => setIsActive(true);
  const handleBlur = () => setIsActive(false);

  let stop: Fn = () => {};
  const start = () => {
    stop();
    const el = access(target);
    if (!el) {
      setIsActive(false);
      return;
    }
    setIsActive(window.document.activeElement === el);
    el.addEventListener("blur", handleBlur, true);
    el.addEventListener("focus", handleFocus, true);
    stop = () => {
      el.removeEventListener("blur", handleBlur, true);
      el.removeEventListener("focus", handleFocus, true);
      stop = () => {};
    };
  };

  const el = access(target);
  setIsActive(!!el && window.document.activeElement === el);

  createEffect(start);
  onCleanup(() => stop());

  return [isActive, { stop, start }];
}

/**
 * Use as a directive. Notifies you when the element becomes active or inactive.
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/active-element#createIsElementActive
 *
 * @example
 * const [active, setActive] = createSignal(false)
 * <input use:isElementActive={setActive} />
 */
export function isElementActive(target: Element, callback: Accessor<IsElementActiveProps>): void {
  const [isFocused] = createIsElementActive(target);
  createComputed(() => callback()(isFocused()));
}
