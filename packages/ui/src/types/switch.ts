import { JSX } from "solid-js";

import { AriaLabelingProps } from "./aria";
import { FocusableDOMProps, FocusableProps } from "./focusable";
import { InputBase } from "./inputs";

interface SwitchBase extends InputBase, FocusableProps {
  /**
   * The content to render as the Switch's label.
   */
  children?: JSX.Element;

  /**
   * Whether the Switch should be selected (uncontrolled).
   */
  defaultSelected?: boolean;

  /**
   * Whether the Switch should be selected (controlled).
   */
  isSelected?: boolean;

  /**
   * The value of the input element, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefvalue).
   */
  value?: string;

  /**
   * The name of the input element, used when submitting an HTML form.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
   */
  name?: string;

  /**
   * Handler that is called when the Switch's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
}

export type SwitchProps = SwitchBase;

export interface AriaSwitchBase extends SwitchBase, FocusableDOMProps, AriaLabelingProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: string;
}

export interface AriaSwitchProps extends SwitchProps, AriaSwitchBase {}
