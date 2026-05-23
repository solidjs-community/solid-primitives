import { type Accessor, createEffect, createSignal } from "solid-js";
import type { BundlesizeItem } from "~/types.js";

export function createPrimitiveNameTooltips(
  target: HTMLElement,
  primitives: Accessor<BundlesizeItem[] | undefined>,
) {
  const [fn, setFn] =
    createSignal<typeof import("./primitive-name-tooltip-impl.jsx").createPrimitiveNameTooltips>();

  createEffect(
    () => fn(),
    fnValue => {
      if (!fnValue) return;
      createEffect(
        () => primitives(),
        primitivesList => {
          if (primitivesList) fnValue({ target, primitives: primitivesList });
        },
      );
    },
  );

  import("./primitive-name-tooltip-impl.jsx").then(({ createPrimitiveNameTooltips }) =>
    setFn(() => createPrimitiveNameTooltips),
  );
}
