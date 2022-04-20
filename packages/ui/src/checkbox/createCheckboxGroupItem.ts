import { Accessor, mergeProps } from "solid-js";

import { createToggleState } from "../toggle";
import { AriaCheckboxGroupItemProps } from "../types";
import { CheckboxAria, createCheckbox } from "./createCheckbox";
import { CheckboxGroupState } from "./createCheckboxGroupState";
import { checkboxGroupNames } from "./utils";

/**
 * Provides the behavior and accessibility implementation for a checkbox component contained within a checkbox group.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox, as returned by `useCheckboxGroupState`.
 * @param inputRef - A ref for the HTML input element.
 */
export function createCheckboxGroupItem(
  props: AriaCheckboxGroupItemProps,
  state: CheckboxGroupState,
  inputRef: Accessor<HTMLInputElement | undefined>
): CheckboxAria {
  const onChange = (isSelected: boolean) => {
    if (props.isDisabled || state.isDisabled()) {
      return;
    }

    isSelected ? state.addValue(props.value) : state.removeValue(props.value);

    props.onChange?.(isSelected);
  };

  const toggleState = createToggleState({
    isReadOnly: () => props.isReadOnly || state.isReadOnly(),
    isSelected: () => state.isSelected(props.value),
    onChange
  });

  const createCheckboxProps = mergeProps(props, {
    get isReadOnly() {
      return props.isReadOnly || state.isReadOnly();
    },
    get isDisabled() {
      return props.isDisabled || state.isDisabled();
    },
    get name() {
      return props.name || checkboxGroupNames.get(state);
    }
  });

  const { inputProps } = createCheckbox(createCheckboxProps, toggleState, inputRef);

  return { inputProps };
}
