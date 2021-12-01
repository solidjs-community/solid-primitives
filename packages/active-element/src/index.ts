import { access, Fn, isClient, MaybeAccessor } from "solid-fns";
import { Accessor, createEffect, createSignal, onCleanup } from "solid-js";

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
  const handleChange = isClient ? () => setActive(window.document.activeElement) : () => {};

  let stop: Fn = () => {};
  const start = () => {
    stop();
    if (isClient) {
      window.addEventListener("blur", handleChange, true);
      window.addEventListener("focus", handleChange, true);
      stop = () => {
        window.removeEventListener("blur", handleChange, true);
        window.removeEventListener("focus", handleChange, true);
        stop = () => {};
      };
    }
  };
  start();
  onCleanup(stop);

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
  const [active, actions] = createActiveElement();
  const [isActive, setIsActive] = createSignal(false);
  createEffect(() => {
    const el = access(target);
    setIsActive(!!el && active() === el);
  });
  return [isActive, actions];
}
