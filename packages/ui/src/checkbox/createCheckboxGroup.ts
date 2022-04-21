import { Accessor, createEffect, createMemo, JSX, mergeProps } from "solid-js";

import { createLabel, LabelAriaProps } from "../label";
import { AriaCheckboxGroupProps, DOMElements } from "../types";
import { combineProps, filterDOMProps } from "../utils";
import { CheckboxGroupState } from "./createCheckboxGroupState";
import { checkboxGroupNames } from "./utils";

interface CheckboxGroupAria<T extends DOMElements, U extends DOMElements> {
  /**
   * Props for the checkbox group wrapper element.
   */
  groupProps: Accessor<JSX.IntrinsicElements[T]>;

  /**
   * Props for the checkbox group's visible label (if any).
   *  */
  labelProps: Accessor<JSX.IntrinsicElements[U]>;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `useCheckboxGroupState`.
 */
export function createCheckboxGroup<T extends DOMElements = "div", U extends DOMElements = "span">(
  props: AriaCheckboxGroupProps,
  state: CheckboxGroupState
): CheckboxGroupAria<T, U> {
  const defaultCreateLabelProps: LabelAriaProps = {
    // Checkbox group is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: "span"
  };

  const createLabelProps = mergeProps(defaultCreateLabelProps, props);

  const { labelProps, fieldProps } = createLabel<U>(createLabelProps);

  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const groupProps = createMemo(() => {
    return combineProps(domProps(), {
      role: "group",
      "aria-disabled": props.isDisabled || undefined,
      ...fieldProps()
    });
  });

  // Pass name prop from group to all items by attaching to the state.
  // This one is mandatory because `createEffect` run after render.
  checkboxGroupNames.set(state, props.name);

  createEffect(() => {
    checkboxGroupNames.set(state, props.name);
  });

  return {
    groupProps: groupProps as Accessor<unknown> as Accessor<JSX.IntrinsicElements[T]>,
    labelProps
  };
}
