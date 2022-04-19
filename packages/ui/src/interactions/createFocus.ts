import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { FocusEvents } from "../types";
import { createSyntheticBlurEvent } from "./utils";

export interface CreateFocusProps extends FocusEvents {
  /**
   * Whether the focus events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export interface FocusElementProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus: FocusEvents["onFocus"];

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur: FocusEvents["onBlur"];
}

export interface FocusResult {
  /**
   * Props to spread onto the target element.
   */
  focusProps: Accessor<FocusElementProps>;
}

/**
 * Handles focus events for the target.
 */
export function createFocus(props: CreateFocusProps): FocusResult {
  const onBlur: FocusEvents["onBlur"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onBlur?.(event);
    props.onFocusChange?.(false);
  };

  const onSyntheticFocus = createSyntheticBlurEvent(onBlur);

  const onFocus: FocusEvents["onFocus"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onFocus?.(event);
    props.onFocusChange?.(true);
    onSyntheticFocus(event);
  };

  const focusProps: Accessor<FocusElementProps> = createMemo(() => ({
    onFocus,
    onBlur,
  }));

  return { focusProps };
}
