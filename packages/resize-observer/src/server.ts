import { noop } from "@solid-primitives/utils";
import type * as API from "./index";

export const makeResizeObserver: typeof API.makeResizeObserver = () => ({
  observe: noop,
  unobserve: noop
});

export const createResizeObserver: typeof API.createResizeObserver = noop;
