import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal, JSX } from "solid-js";

import { createFocus } from "../interactions";
import { FocusEvents } from "../types";
import { isObject } from "../utils";

interface CreateVisuallyHiddenProps {
  /**
   * Whether the element should become visible on focus, for example skip links.
   */
  isFocusable?: MaybeAccessor<boolean | undefined>;

  /**
   * The style prop of the element.
   */
  style?: MaybeAccessor<JSX.HTMLAttributes<HTMLElement>["style"] | undefined>;
}

interface VisuallyHiddenProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus: FocusEvents["onFocus"];

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur: FocusEvents["onBlur"];

  /**
   * The style prop of the element, which may contains the visually hidden styles.
   */
  style?: JSX.HTMLAttributes<HTMLElement>["style"];
}

interface VisuallyHiddenResult {
  /**
   * Props to spread onto the target element.
   */
  visuallyHiddenProps: Accessor<VisuallyHiddenProps>;
}

const visuallyHiddenStyles: JSX.CSSProperties = {
  border: 0,
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: 1,
  margin: "0 -1px -1px 0",
  overflow: "hidden",
  padding: 0,
  position: "absolute",
  width: 1,
  "white-space": "nowrap",
};

/**
 * Provides props for an element that hides its children visually
 * but keeps content visible to assistive technology.
 */
export function createVisuallyHidden(props: CreateVisuallyHiddenProps = {}): VisuallyHiddenResult {
  const [isFocused, setFocused] = createSignal(false);

  const { focusProps } = createFocus({
    isDisabled: () => !access(props.isFocusable),
    onFocusChange: setFocused,
  });

  // If focused, don't hide the element.
  const combinedStyles = createMemo(() => {
    const style = access(props.style);

    if (isFocused()) {
      return style;
    }

    if (isObject(style)) {
      return { ...visuallyHiddenStyles, ...style };
    }

    return visuallyHiddenStyles;
  });

  const visuallyHiddenProps: Accessor<VisuallyHiddenProps> = createMemo(() => ({
    ...focusProps(),
    style: combinedStyles(),
  }));

  return { visuallyHiddenProps };
}
