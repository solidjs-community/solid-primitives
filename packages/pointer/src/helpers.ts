import { pick } from "@solid-primitives/immutable";
import { Position } from "@solid-primitives/utils";
import {
  AnyOnEventName,
  ParsedEventHandlers,
  PointerState,
  PointerStateWithActive,
  ReverseOnEventName
} from "./types";

/**
 * A non-reactive helper function. It turns a position relative to the screen/window, to be relative to an element.
 * @param poz object containing `x` & `y`
 * @param el element to calculate the position of
 * @returns the `poz` with `x` and `y` changed, and `isInside` added
 */
export const getPositionToElement = <T extends Position>(
  poz: T,
  el: Element
): T & { isInside: boolean } => {
  const { top, left, width, height } = el.getBoundingClientRect(),
    x = poz.x - left,
    y = poz.y - top;
  return {
    ...poz,
    x,
    y,
    isInside: x >= 0 && y >= 0 && x <= width && y <= height
  };
};

const parseOnEventName = <T extends string>(name: T) =>
  name.substring(2).toLowerCase() as ReverseOnEventName<T>;
export const parseHandlersMap = <H extends Record<AnyOnEventName, any>>(
  handlers: H
): ParsedEventHandlers<H> => {
  const result = {} as any;
  Object.entries(handlers).forEach(([name, fn]) => (result[parseOnEventName(name)] = fn));
  return result;
};

const pointerStateKeys: (keyof PointerState)[] = [
  "x",
  "y",
  "pointerId",
  "pressure",
  "tiltX",
  "tiltY",
  "width",
  "height",
  "twist",
  "pointerType"
];
export const toState = (e: PointerEvent): PointerState =>
  pick(e, ...pointerStateKeys) as PointerState;
export const toStateActive = (e: PointerEvent, isActive: boolean) => ({
  ...toState(e),
  isActive
});

export const DEFAULT_STATE: PointerStateWithActive = {
  x: 0,
  y: 0,
  pointerId: 0,
  pressure: 0,
  tiltX: 0,
  tiltY: 0,
  width: 0,
  height: 0,
  twist: 0,
  pointerType: null,
  isActive: false
};
