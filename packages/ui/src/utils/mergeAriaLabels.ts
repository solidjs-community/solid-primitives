import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { AriaLabelingProps, DOMProps } from "../types";
import { createId } from "./createId";

export interface MergeAriaLabelsProps {
  /**
   * The element's unique identifier.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id).
   */
  id?: MaybeAccessor<string | undefined>;

  /**
   * Defines a string value that labels the current element.
   */
  "aria-label"?: MaybeAccessor<string | undefined>;

  /**
   * Identifies the element (or elements) that labels the current element.
   */
  "aria-labelledby"?: MaybeAccessor<string | undefined>;
}

export interface AriaLabelsResult {
  /**
   * Props to apply to the field container element being labeled.
   */
  ariaLabelsProps: Accessor<DOMProps & AriaLabelingProps>;
}

/**
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 * @param props - Aria label props.
 * @param defaultAriaLabel - Default value for aria-label when not present.
 */
export function mergeAriaLabels(
  props: MergeAriaLabelsProps,
  defaultAriaLabel?: MaybeAccessor<string | undefined>
): AriaLabelsResult {
  const defaultId = createId();

  const id = () => access(props.id) ?? defaultId;

  const ariaLabelsProps: Accessor<DOMProps & AriaLabelingProps> = createMemo(() => {
    const defaultLabel = access(defaultAriaLabel);
    let label = access(props["aria-label"]);
    let labelledBy = access(props["aria-labelledby"]);

    // If there is both an aria-label and aria-labelledby,
    // combine them by pointing to the element itself.
    // ex: `<input id="foo" aria-label="Email" aria-labelledby="foo" />`
    if (labelledBy && label) {
      const ids = new Set([...labelledBy.trim().split(/\s+/), id()]);
      labelledBy = [...ids].join(" ");
    } else if (labelledBy) {
      labelledBy = labelledBy.trim().split(/\s+/).join(" ");
    }

    // If no labels are provided, use the default
    if (!label && !labelledBy && defaultLabel) {
      label = defaultLabel;
    }

    return {
      id: id(),
      "aria-label": label,
      "aria-labelledby": labelledBy
    };
  });

  return { ariaLabelsProps };
}
