import { MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, JSX, mergeProps, splitProps } from "solid-js";

import { AriaLabelingProps, DOMElements, DOMProps, ElementType, LabelableProps } from "../types";
import { createId, mergeAriaLabels } from "../utils";

export interface LabelAriaProps extends LabelableProps, DOMProps, AriaLabelingProps {
  /**
   * The HTML element used to render the label, e.g. 'label', or 'span'.
   * @default 'label'
   */
  labelElementType?: MaybeAccessor<ElementType | undefined>;
}

export interface LabelAria<T extends DOMElements> {
  /**
   * Props to apply to the label container element.
   */
  labelProps: Accessor<JSX.IntrinsicElements[T]>;

  /**
   * Props to apply to the field container element being labeled.
   */
  fieldProps: Accessor<DOMProps & AriaLabelingProps>;
}

/**
 * Provides the accessibility implementation for labels and their associated elements.
 * Labels provide context for user inputs.
 * @param props - The props for labels and fields.
 */
export function createLabel<T extends DOMElements = "label">(props: LabelAriaProps): LabelAria<T> {
  const defaultFieldId = createId();
  const labelId = createId();

  const defaultProps: LabelAriaProps = {
    id: defaultFieldId,
    labelElementType: "label"
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local] = splitProps(propsWithDefault, [
    "id",
    "label",
    "aria-labelledby",
    "aria-label",
    "labelElementType"
  ]);

  const labelProps: Accessor<JSX.IntrinsicElements[T]> = createMemo(() => {
    if (!local.label) {
      return {};
    }

    return {
      id: labelId,
      for: local.labelElementType === "label" ? local.id : undefined
    };
  });

  const ariaLabelledby = createMemo(() => {
    if (!local.label) {
      return local["aria-labelledby"];
    }

    return local["aria-labelledby"] ? `${local["aria-labelledby"]} ${labelId}` : labelId;
  });

  const { ariaLabelsProps: fieldProps } = mergeAriaLabels({
    id: () => local.id,
    "aria-label": () => local["aria-label"],
    "aria-labelledby": ariaLabelledby
  });

  return { labelProps, fieldProps };
}
