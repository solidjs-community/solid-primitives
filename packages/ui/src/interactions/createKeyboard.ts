import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { KeyboardEvents } from "../types";

export interface CreateKeyboardProps extends KeyboardEvents {
  /**
   * Whether the keyboard events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export interface keyboardElementProps {
  /**
   * Handler that is called when a key is pressed.
   */
  onKeyDown: KeyboardEvents["onKeyDown"];

  /**
   * Handler that is called when a key is released.
   */
  onKeyUp: KeyboardEvents["onKeyUp"];
}

export interface KeyboardResult {
  /**
   * Props to spread onto the target element.
   */
  keyboardProps: Accessor<keyboardElementProps>;
}

/**
 * Handles keyboard events for the target.
 */
export function createKeyboard(props: CreateKeyboardProps): KeyboardResult {
  const onKeyDown: CreateKeyboardProps["onKeyDown"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onKeyDown?.(event);
  };

  const onKeyUp: CreateKeyboardProps["onKeyUp"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onKeyUp?.(event);
  };

  const keyboardProps: Accessor<keyboardElementProps> = createMemo(() => ({
    onKeyDown,
    onKeyUp,
  }));

  return { keyboardProps };
}
