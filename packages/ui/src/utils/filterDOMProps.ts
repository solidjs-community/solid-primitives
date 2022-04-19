import { splitProps } from "solid-js";

import { AriaLabelingProps, DOMProps } from "../types";

/**
 * A set of common DOM props that are allowed on any component
 * Ensure this is synced with DOMProps in types/dom.
 */
const DOMPropNames = new Set(["id"]);

/**
 * A set of common DOM props that are allowed on any component
 * Ensure this is synced with AriaLabelingProps in types/aria.
 */
const labelablePropNames = new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details",
]);

interface Options {
  /**
   * If labelling associated aria properties should be included in the filter.
   */
  labelable?: boolean;

  /**
   * A Set of other property names that should be included in the filter.
   */
  propNames?: Set<string>;
}

const dataAttrsRegex = /^(data-.*)$/;

// Note: "valid DOM props" refers to the `DOMPropNames` Set above.
/**
 * Filters out all props that aren't valid DOM props or defined via override prop obj.
 * @param props - The component props to be filtered.
 * @param opts - Props to override.
 */
export function filterDOMProps(
  props: Record<string, any> & DOMProps & AriaLabelingProps,
  opts: Options = {}
): DOMProps & AriaLabelingProps {
  const { labelable, propNames } = opts;
  const filteredPropNames: Array<string> = [];

  for (const prop in props) {
    if (
      Object.prototype.hasOwnProperty.call(props, prop) &&
      (DOMPropNames.has(prop) ||
        (labelable && labelablePropNames.has(prop)) ||
        propNames?.has(prop) ||
        dataAttrsRegex.test(prop))
    ) {
      filteredPropNames.push(prop);
    }
  }

  const [filteredProps] = splitProps(props, filteredPropNames as any);

  return filteredProps;
}
