import { noop } from "@solid-primitives/utils";
import { DEFAULT_STATE } from "./helpers";
import type * as API from "./index";

export { getPositionToElement } from "./helpers";

export const createPointerListeners: typeof API.createPointerListeners = () => noop;

export const createPerPointerListeners: typeof API.createPerPointerListeners = noop;

export const createPointerPosition: typeof API.createPointerPosition = () => () => DEFAULT_STATE;

export const createPointerList: typeof API.createPointerList = () => () => [];

export const pointerHover: typeof API.pointerHover = noop;
