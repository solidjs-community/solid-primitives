/**
 * A set of common labelling DOM props that are allowed on any component
 * Ensure this is synced with labelablePropNames in utils/filterDOMProps.
 */
export interface AriaLabelingProps {
  /**
   * Defines a string value that labels the current element.
   */
  "aria-label"?: string;

  /**
   * Identifies the element (or elements) that labels the current element.
   */
  "aria-labelledby"?: string;

  /**
   * Identifies the element (or elements) that describes the object.
   */
  "aria-describedby"?: string;

  /**
   * Identifies the element (or elements) that provide a detailed, extended description for the object.
   */
  "aria-details"?: string;
}

export interface AriaValidationProps {
  /**
   * Identifies the element that provides an error message for the object.
   * @see https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage
   */
  "aria-errormessage"?: string;
}
