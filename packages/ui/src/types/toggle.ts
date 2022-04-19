import { AriaLabelingProps, AriaValidationProps } from "./aria";
import { FocusableDOMProps, FocusableProps } from "./focusable";
import { InputBase, Validation } from "./inputs";

export interface ToggleProps extends InputBase, Validation, FocusableProps {
  /**
   * Whether the element should be selected (uncontrolled).
   */
  defaultSelected?: boolean;

  /**
   * Whether the element should be selected (controlled).
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
   * Handler that is called when the element's selection state changes.
   */
  onChange?: (isSelected: boolean) => void;
}

export interface AriaToggleProps
  extends ToggleProps,
    FocusableDOMProps,
    AriaLabelingProps,
    AriaValidationProps {
  /**
   * Identifies the element (or elements) whose contents or presence are controlled by the current element.
   */
  "aria-controls"?: string;
}
