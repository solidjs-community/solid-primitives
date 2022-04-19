import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal } from "solid-js";

import { FocusWithinEvents } from "../types";
import { createSyntheticBlurEvent } from "./utils";

export interface CreateFocusWithinProps extends FocusWithinEvents {
  /**
   * Whether the focus within events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export type FocusWithinElementProps = Required<Pick<FocusWithinEvents, "onFocusIn" | "onFocusOut">>;

export interface FocusWithinResult {
  /**
   * Props to spread onto the target element.
   */
  focusWithinProps: Accessor<FocusWithinElementProps>;
}

/**
 * Handles focus events for the target and its descendants.
 */
export function createFocusWithin(props: CreateFocusWithinProps): FocusWithinResult {
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  const onFocusOut: FocusWithinEvents["onFocusOut"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    const currentTarget = event.currentTarget as Element | null;
    const relatedTarget = event.relatedTarget as Element | null;

    // We don't want to trigger onFocusOut and then immediately onFocusIn again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (isFocusWithin() && !currentTarget?.contains(relatedTarget)) {
      setIsFocusWithin(false);
      props.onFocusOut?.(event);
      props.onFocusWithinChange?.(false);
    }
  };

  const onSyntheticFocus = createSyntheticBlurEvent(onFocusOut);

  const onFocusIn: FocusWithinEvents["onFocusIn"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    if (!isFocusWithin()) {
      props.onFocusIn?.(event);
      props.onFocusWithinChange?.(true);
      setIsFocusWithin(true);
      onSyntheticFocus(event);
    }
  };

  const focusWithinProps: Accessor<FocusWithinElementProps> = createMemo(() => ({
    onFocusIn,
    onFocusOut,
  }));

  return { focusWithinProps };
}
