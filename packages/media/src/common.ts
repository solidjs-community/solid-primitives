import { entries } from "@solid-primitives/utils";
import { Breakpoints, Matches } from "./types";

export const getEmptyMatchesFromBreakpoints = <T extends Breakpoints>(
  breakpoints: T
): Matches<T> => {
  const matches = {} as Record<keyof T, boolean>;
  entries(breakpoints).forEach(([key]) => (matches[key] = false));
  return matches;
};
