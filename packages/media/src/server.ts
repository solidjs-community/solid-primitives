import { getEmptyMatchesFromBreakpoints } from "./common";
import type * as API from "./index";

const createMediaQuery: typeof API.default =
  (_query, _initialState = false, _watchChange = true) =>
  () =>
    false;

export const createBreakpoints: typeof API.createBreakpoints = (breakpoints, options = {}) =>
  options.fallbackMatch || getEmptyMatchesFromBreakpoints(breakpoints);

export default createMediaQuery;
