import { type Accessor, createEffect, untrack, createSignal } from "solid-js";
import type { BundlesizeItem } from "~/types.js";

export function createPrimitiveNameTooltips(
  target: HTMLElement,
  primitives: Accessor<BundlesizeItem[] | undefined>,
) {
  const [fn, setFn] =
    createSignal<typeof import("./primitive-name-tooltip.client.jsx").createPrimitiveNameTooltips>();

  createEffect(() => {
    const fnValue = fn();
    if (fnValue) {
      createEffect(() => {
        const primitivesList = primitives();
        if (primitivesList) untrack(() => fnValue({ target, primitives: primitivesList }));
      });
    }
  });

  import("./primitive-name-tooltip.client.jsx").then(({ createPrimitiveNameTooltips }) =>
    setFn(() => createPrimitiveNameTooltips),
  );
}
