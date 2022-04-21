import { Accessor, createMemo, JSX, mergeProps, splitProps } from "solid-js";

import { createFocusable } from "../focus";
import { createPress } from "../interactions";
import { AriaToggleProps } from "../types";
import { combineProps, filterDOMProps } from "../utils";
import { ToggleState } from "./createToggleState";

export interface ToggleAria {
  /**
   * Props to be spread on the input element.
   */
  inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>>;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 * @param props - Props for the toggle element.
 * @param state - State for the toggle element, as returned by `createToggleState`.
 * @param inputRef - Ref to the HTML input element.
 */
export function createToggle(
  props: AriaToggleProps,
  state: ToggleState,
  inputRef: Accessor<HTMLInputElement | undefined>
): ToggleAria {
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

    const target = event.target as HTMLInputElement;

    state.setSelected(target.checked);

    // Unlike in React, inputs `checked` state can be out of sync with our toggle state.
    // for example a readonly `<input type="checkbox" />` is always "checkable".
    //
    // Also even if an input is controlled (ex: `<input type="checkbox" checked={isChecked} />`,
    // clicking on the input will change its internal `checked` state.
    //
    // To prevent this, we need to force the input `checked` state to be in sync with the toggle state.
    target.checked = state.isSelected();
  };

  const { pressProps } = createPress(props);

  const { focusableProps } = createFocusable(props, inputRef);
  const domProps = createMemo(() => filterDOMProps(props, { labelable: true }));

  const inputProps = createMemo(() => {
    console.log(domProps());

    return combineProps(
      domProps(),
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
