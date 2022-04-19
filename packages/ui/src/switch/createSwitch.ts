import { Accessor, createMemo, JSX } from "solid-js";

import { createToggle, ToggleState } from "../toggle";
import { AriaSwitchProps } from "../types";

export interface SwitchAria {
  /**
   * Props for the input element.
   */
  inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>>;
}

/**
 * Provides the behavior and accessibility implementation for a switch component.
 * A switch is similar to a checkbox, but represents on/off values as opposed to selection.
 * @param props - Props for the switch.
 * @param state - State for the switch, as returned by `createToggleState`.
 * @param ref - Ref to the HTML input element.
 */
export function createSwitch(
  props: AriaSwitchProps,
  state: ToggleState,
  ref?: HTMLInputElement
): SwitchAria {
  const { inputProps: toggleInputProps } = createToggle(props, state, ref);
  const { isSelected } = state;

  const inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>> = createMemo(() => ({
    ...toggleInputProps(),
    role: "switch",
    checked: isSelected(),
    "aria-checked": isSelected(),
  }));

  return { inputProps };
}
