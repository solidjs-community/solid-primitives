import { JSX } from "solid-js";

import { AriaLabelingProps, AriaValidationProps } from "./aria";
import { DOMProps } from "./dom";
import { InputBase, ValueBase } from "./inputs";
import { LabelableProps } from "./labelable";
import { AriaToggleProps, ToggleProps } from "./toggle";

export interface CheckboxGroupProps extends ValueBase<string[]>, InputBase, LabelableProps {}

export interface CheckboxProps extends ToggleProps {
  /**
   * Indeterminism is presentational only.
   * The indeterminate visual representation remains regardless of user interaction.
   */
  isIndeterminate?: boolean;
}

export interface AriaCheckboxProps extends CheckboxProps, AriaToggleProps {}

export interface AriaCheckboxGroupProps
  extends CheckboxGroupProps,
    DOMProps,
    AriaLabelingProps,
    AriaValidationProps {
  /**
   * The Checkboxes contained within the CheckboxGroup.
   */
  children?: JSX.Element;

  /**
   * The name of the CheckboxGroup, used when submitting an HTML form.
   */
  name?: string;
}

export interface AriaCheckboxGroupItemProps
  extends Omit<AriaCheckboxProps, "isSelected" | "defaultSelected"> {
  value: string;
}
