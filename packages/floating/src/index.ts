export * from "./types.ts";
export {
  computePosition,
  computePositionFromRects,
  getClippingRect,
  getOppositePlacement,
  type SolveExtras,
} from "./compute.ts";
export { makeAutoUpdate, autoUpdate, type AutoUpdateOptions } from "./autoUpdate.ts";
export { getSizeCssVars, applySizeCssVars } from "./css.ts";
export {
  createFloating,
  type CreateFloatingOptions,
  type FloatingReturn,
  type FloatingStyles,
} from "./floating.ts";
