import type { MiddlewareData } from "./types.ts";

/**
 * Turns the computed space into CSS variables, ready to spread into a `style` prop:
 * `max-height: var(--available-height)`, `transform-origin: var(--transform-origin)`.
 */
export function getSizeCssVars(
  data: Pick<MiddlewareData, "availableWidth" | "availableHeight" | "transformOrigin">,
): Record<"--available-width" | "--available-height" | "--transform-origin", string> {
  return {
    "--available-width": `${data.availableWidth}px`,
    "--available-height": `${data.availableHeight}px`,
    "--transform-origin": data.transformOrigin,
  };
}

/** Writes `getSizeCssVars(data)` onto an element's inline style. */
export function applySizeCssVars(
  element: HTMLElement,
  data: Pick<MiddlewareData, "availableWidth" | "availableHeight" | "transformOrigin">,
): void {
  for (const [name, value] of Object.entries(getSizeCssVars(data))) {
    element.style.setProperty(name, value);
  }
}
