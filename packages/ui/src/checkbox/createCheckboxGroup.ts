import { Accessor, createEffect, createMemo, JSX, mergeProps } from "solid-js";

import { createLabel, LabelAriaProps } from "../label";
import { AriaCheckboxGroupProps } from "../types";
import { combineProps, filterDOMProps } from "../utils";
import { CheckboxGroupState } from "./createCheckboxGroupState";
import { checkboxGroupNames } from "./utils";

interface CheckboxGroupAria {
  /**
   * Props for the checkbox group wrapper element.
   */
  groupProps: Accessor<JSX.HTMLAttributes<HTMLElement>>;

  /**
   * Props for the checkbox group's visible label (if any).
   *  */
  labelProps: Accessor<JSX.HTMLAttributes<HTMLElement>>;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function createCheckboxGroup(
  props: AriaCheckboxGroupProps,
  state: CheckboxGroupState
): CheckboxGroupAria {
  const defaultCreateLabelProps: LabelAriaProps = {
    // Checkbox group is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: "span"
  };

  const createLabelProps = mergeProps(defaultCreateLabelProps, props);

  const { labelProps, fieldProps } = createLabel(createLabelProps);

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const groupProps: Accessor<JSX.HTMLAttributes<HTMLElement>> = createMemo(() => {
    return combineProps(domProps(), {
      role: "group",
      "aria-disabled": props.isDisabled || undefined,
      ...fieldProps()
    } as JSX.HTMLAttributes<HTMLElement>);
  });

  // Pass name prop from group to all items by attaching to the state.
  // This one is mandatory because `createEffect` run after render.
  checkboxGroupNames.set(state, props.name);

  createEffect(() => {
    checkboxGroupNames.set(state, props.name);
  });

  return {
    groupProps,
    labelProps: labelProps as Accessor<JSX.HTMLAttributes<HTMLElement>>
  };
}
