import type { Setter } from "solid-js";

/**
 * Wraps a boolean setter with a `toggle` function that flips the current value.
 * @see https://github.com/solidjs-community/solid-primitives/issues/280
 * @example
 * const [isOpen, setIsOpen] = createSignal(false);
 * const toggleOpen = toggle(setIsOpen);
 * toggleOpen(); // isOpen() === true
 */
export function toggle(setValue: Setter<boolean>): () => void {
  return () => setValue(value => !value);
}
