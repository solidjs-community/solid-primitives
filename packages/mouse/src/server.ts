import { noop } from "@solid-primitives/utils";
import * as API from ".";
import { DEFAULT_MOUSE_POSITION, DEFAULT_RELATIVE_ELEMENT_POSITION } from "./common";

export { getPositionToElement, getPositionToScreen, getPositionInElement } from ".";

export const makeMousePositionListener: typeof API.makeMousePositionListener = () => noop;
export const makeMouseInsideListener: typeof API.makeMouseInsideListener = () => noop;
export const createMousePosition: typeof API.createMousePosition = () => DEFAULT_MOUSE_POSITION;
export const useMousePosition: typeof API.useMousePosition = () => DEFAULT_MOUSE_POSITION;
export const createPositionToElement: typeof API.createPositionToElement = () =>
  DEFAULT_RELATIVE_ELEMENT_POSITION;
