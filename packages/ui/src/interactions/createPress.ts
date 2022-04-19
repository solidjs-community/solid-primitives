import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { PressEvents } from "../types";

export interface CreatePressProps extends PressEvents {
  /**
   * Whether the press events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export interface PressElementProps {
  /**
   * Handler that is called when a pointing device is both pressed and released while the pointer is over the target.
   */
  onClick: (e: MouseEvent) => void;

  /**
   * Handler that is called when a pointing device is pressed while the pointer is over the target.
   */
  onMouseDown: (e: MouseEvent) => void;

  /**
   * Handler that is called when a pointing device is released while the pointer is over the target.
   */
  onMouseUp: (e: MouseEvent) => void;
}

export interface PressResult {
  /**
   * Props to spread onto the target element.
   */
  pressProps: Accessor<PressElementProps>;
}

/**
 * Handles press events for the target.
 */
export function createPress(props: CreatePressProps): PressResult {
  const onClick: CreatePressProps["onClick"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onClick?.(event);
  };

  const onMouseDown: CreatePressProps["onMouseDown"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onMouseDown?.(event);
    props.onPressChange?.(true);
  };

  const onMouseUp: CreatePressProps["onMouseUp"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onMouseUp?.(event);
    props.onPressChange?.(false);
  };

  const pressProps: Accessor<PressElementProps> = createMemo(() => ({
    onClick,
    onMouseDown,
    onMouseUp,
  }));

  return { pressProps };
}
