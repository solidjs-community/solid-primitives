import { Accessor, createEffect, createMemo, JSX, on } from "solid-js";

import { AriaCheckboxProps } from "../types";
import { createToggle, ToggleState } from "../toggle";

export interface CheckboxAria {
  /**
   * Props for the input element.
   */
  inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>>;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component.
 * Checkboxes allow users to select multiple items from a list of individual items,
 * or to mark one individual item as selected.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useToggleState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function createCheckbox(
  props: AriaCheckboxProps,
  state: ToggleState,
  inputRef?: HTMLInputElement
): CheckboxAria {
  const { inputProps: toggleInputProps } = createToggle(props, state, inputRef);
  const { isSelected } = state;

  // indeterminate is a property, but it can only be set via javascript
  // https://css-tricks.com/indeterminate-checkboxes/
  createEffect(
    on(
      () => props.isIndeterminate,
      () => {
        if (inputRef) {
          inputRef.indeterminate = props.isIndeterminate || false;
        }
      }
    )
  );

  const inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>> = createMemo(() => ({
    ...toggleInputProps(),
    checked: isSelected(),
    "aria-checked": props.isIndeterminate ? "mixed" : isSelected()
  }));

  return { inputProps };
}
