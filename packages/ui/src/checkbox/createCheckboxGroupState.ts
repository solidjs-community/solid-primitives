import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor } from "solid-js";

import { createControllableArraySignal } from "../utils";

export interface CreateCheckboxGroupStateProps {
  /**
   * The current selected values (controlled).
   */
  value?: MaybeAccessor<string[] | undefined>;

  /**
   * The default selected values (uncontrolled).
   */
  defaultValue?: MaybeAccessor<string[] | undefined>;

  /**
   * Whether the checkbox group is disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the checkbox group is read only.
   */
  isReadOnly?: MaybeAccessor<boolean | undefined>;

  /**
   * Handler that is called when the value changes.
   */
  onChange?: (value: string[]) => void;
}

export interface CheckboxGroupState {
  /**
   * Current selected values.
   */
  readonly value: Accessor<string[]>;

  /**
   * Whether the checkbox group is disabled.
   */
  readonly isDisabled: Accessor<boolean>;

  /**
   * Whether the checkbox group is read only.
   */
  readonly isReadOnly: Accessor<boolean>;

  /**
   * Returns whether the given value is selected.
   */
  isSelected(value: string): boolean;

  /**
   * Sets the selected values.
   */
  setValue(value: string[]): void;

  /**
   * Adds a value to the set of selected values.
   */
  addValue(value: string): void;

  /**
   * Removes a value from the set of selected values.
   */
  removeValue(value: string): void;

  /**
   * Toggles a value in the set of selected values.
   */
  toggleValue(value: string): void;
}

/**
 * Provides state management for a checkbox group component.
 */
export function createCheckboxGroupState(
  props: CreateCheckboxGroupStateProps = {}
): CheckboxGroupState {
  const [selectedValues, setSelectedValues] = createControllableArraySignal<string>({
    value: () => access(props.value),
    defaultValue: () => access(props.defaultValue) || [],
    onChange: props.onChange
  });

  const addToSelectedValues = (value: string) => {
    setSelectedValues(selectedValues().concat(value));
  };

  const removeFromSelectedValues = (value: string) => {
    setSelectedValues(selectedValues().filter(existingValue => existingValue !== value));
  };

  const isDisabled = () => {
    return access(props.isDisabled) || false;
  };

  const isReadOnly = () => {
    return access(props.isReadOnly) || false;
  };

  const isSelected = (value: string) => {
    return selectedValues().includes(value);
  };

  const setValue = (value: string[]) => {
    if (isDisabled() || isReadOnly()) {
      return;
    }

    setSelectedValues(value);
  };

  const addValue = (value: string) => {
    if (isDisabled() || isReadOnly() || isSelected(value)) {
      return;
    }

    addToSelectedValues(value);
  };

  const removeValue = (value: string) => {
    if (isDisabled() || isReadOnly() || !isSelected(value)) {
      return;
    }

    removeFromSelectedValues(value);
  };

  const toggleValue = (value: string) => {
    if (isDisabled() || isReadOnly()) {
      return;
    }

    isSelected(value) ? removeFromSelectedValues(value) : addToSelectedValues(value);
  };

  return {
    value: selectedValues,
    isDisabled,
    isReadOnly,
    isSelected,
    setValue,
    addValue,
    removeValue,
    toggleValue
  };
}
