import { noop } from "@solid-primitives/utils";
import { getEmptyMatchesFromBreakpoints } from "./common";
import type * as API from "./index";

export const makeMediaQueryListener: typeof API.makeMediaQueryListener = () => noop;

export const createMediaQuery: typeof API.default =
  (_, fallback = false) =>
  () =>
    fallback;

export const createBreakpoints: typeof API.createBreakpoints = (breakpoints, options) =>
  options?.fallbackState || getEmptyMatchesFromBreakpoints(breakpoints);

export default createMediaQuery;
