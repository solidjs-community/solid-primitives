import { Accessor, createEffect, untrack, createSignal } from "solid-js";
import { BundlesizeItem } from "~/types";

export function createPrimitiveNameTooltips(
  target: HTMLElement,
  primitives: Accessor<BundlesizeItem[] | undefined>,
) {
  const [fn, setFn] =
    createSignal<typeof import("./primitive-name-tooltip.client").createPrimitiveNameTooltips>();

  createEffect(() => {
    const fnValue = fn();
    if (fnValue) {
      createEffect(() => {
        const primitivesList = primitives();
        if (primitivesList) untrack(() => fnValue({ target, primitives: primitivesList }));
      });
    }
  });

  import("./primitive-name-tooltip.client").then(({ createPrimitiveNameTooltips }) =>
    setFn(() => createPrimitiveNameTooltips),
  );
}
