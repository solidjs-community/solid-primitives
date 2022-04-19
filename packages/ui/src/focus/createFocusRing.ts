import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import {
  createFocus,
  createFocusVisibleListener,
  createFocusWithin,
  FocusElementProps,
  FocusWithinElementProps,
  isKeyboardFocusVisible,
} from "../interactions";

export interface CreateFocusRingProps {
  /**
   * Whether to show the focus ring when something
   * inside the container element has focus (true), or
   * only if the container itself has focus (false).
   * @default 'false'
   */
  within?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the element is a text input.
   */
  isTextInput?: MaybeAccessor<boolean | undefined>;

  /**
   * Whether the element will be auto focused.
   */
  autoFocus?: MaybeAccessor<boolean | undefined>;
}

export type FocusRingElementProps = FocusElementProps | FocusWithinElementProps;

export interface FocusRingResult {
  /**
   * Whether the element is currently focused.
   */
  isFocused: Accessor<boolean>;

  /**
   * Whether keyboard focus should be visible.
   */
  isFocusVisible: Accessor<boolean>;

  /**
   * Props to apply to the container element with the focus ring.
   */
  focusRingProps: Accessor<FocusRingElementProps>;
}

/**
 * Determines whether a focus ring should be shown to indicate keyboard focus.
 * Focus rings are visible only when the user is interacting with a keyboard,
 * not with a mouse, touch, or other input methods.
 */
export function createFocusRing(props: CreateFocusRingProps = {}): FocusRingResult {
  const [state, setState] = createStore({
    isFocused: false,
    isFocusVisible: access(props.autoFocus) || isKeyboardFocusVisible(),
  });

  const [isFocused, setFocused] = createSignal(false);
  const [isFocusVisibleState, setFocusVisibleState] = createSignal(false);

  const updateState = () => setFocusVisibleState(state.isFocused && state.isFocusVisible);

  const onFocusChange = (isFocused: boolean) => {
    setState("isFocused", isFocused);
    setFocused(isFocused);
    updateState();
  };

  createFocusVisibleListener(
    isFocusVisible => {
      setState("isFocusVisible", isFocusVisible);
      updateState();
    },
    () => null, // hack for passing a dep that never changes
    { isTextInput: !!access(props.isTextInput) }
  );

  const isFocusVisible = () => state.isFocused && isFocusVisibleState();

  const { focusProps } = createFocus({
    isDisabled: () => access(props.within),
    onFocusChange,
  });

  const { focusWithinProps } = createFocusWithin({
    isDisabled: () => !access(props.within),
    onFocusWithinChange: onFocusChange,
  });

  const focusRingProps: Accessor<FocusRingElementProps> = () => {
    return access(props.within) ? focusWithinProps() : focusProps();
  };

  return {
    isFocused,
    isFocusVisible,
    focusRingProps,
  };
}
