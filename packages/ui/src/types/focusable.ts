import { DOMProps } from "./dom";
import { FocusEvents, KeyboardEvents } from "./events";

export interface FocusableProps extends FocusEvents, KeyboardEvents {
  /**
   * Whether the element should receive focus on render.
   */
  autoFocus?: boolean;
}

export interface FocusableDOMProps extends DOMProps {
  /**
   * Whether to exclude the element from the sequential tab order. If true,
   * the element will not be focusable via the keyboard by tabbing. This should
   * be avoided except in rare scenarios where an alternative means of accessing
   * the element or its functionality via the keyboard is available.
   */
  excludeFromTabOrder?: boolean;
}
