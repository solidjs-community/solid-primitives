import { Accessor, createMemo, JSX, mergeProps, splitProps } from "solid-js";

import { createFocusable } from "../focus";
import { createPress } from "../interactions";
import { AriaToggleProps } from "../types";
import { combineProps, filterDOMProps } from "../utils";
import { ToggleState } from "./createToggleState";

export interface ToggleResult {
  /**
   * Props to be spread on the input element.
   */
  inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>>;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function createToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref?: HTMLElement
): ToggleResult {
  const defaultProps: AriaToggleProps = {
    isDisabled: false,
    validationState: "valid"
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local] = splitProps(propsWithDefault, [
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "value",
    "name",
    "aria-errormessage",
    "aria-controls",
    "validationState"
  ]);

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    event.stopPropagation();
    state.setSelected((event.target as HTMLInputElement).checked);
  };

  const { pressProps } = createPress(props);

  const { focusableProps } = createFocusable(props, ref);
  const domProps = filterDOMProps(props, { labelable: true });

  const inputProps = createMemo(() => {
    return combineProps(
      domProps,
      {
        "aria-invalid": local.validationState === "invalid" || undefined,
        "aria-errormessage": local["aria-errormessage"],
        "aria-controls": local["aria-controls"],
        "aria-readonly": local.isReadOnly || undefined,
        "aria-required": local.isRequired || undefined,
        disabled: local.isDisabled,
        value: local.value,
        name: local.name,
        type: "checkbox",
        onChange
      },
      pressProps(),
      focusableProps()
    );
  });

  return { inputProps };
}
