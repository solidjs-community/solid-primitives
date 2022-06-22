import { noop } from "@solid-primitives/utils";
import type * as API from "./index";

export const makeResizeObserver: typeof API.makeResizeObserver = () => ({
  observe: noop,
  unobserve: noop
});

export const createResizeObserver: typeof API.createResizeObserver = noop;

export const getWindowSize: typeof API.getWindowSize = () => ({
  height: 0,
  width: 0
});

export const createWindowSize: typeof API.createWindowSize = getWindowSize;
export const useWindowSize: typeof API.useWindowSize = getWindowSize;

export const getElementSize: typeof API.getElementSize = () => ({
  height: 0,
  width: 0
});

export const createElementSize: typeof API.createElementSize = () => ({
  height: 0,
  width: 0
});
