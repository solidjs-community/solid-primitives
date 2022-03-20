import { isServer } from "solid-js/web";
import { Breakpoints, Matches } from "./types";

export const entries = Object.entries as <T extends object>(obj: T) => [keyof T, T[keyof T]][];

export const getEmptyMatchesFromBreakpoints = <T extends Breakpoints>(
  breakpoints: T
): Matches<T> => {
  const matches = {} as Record<keyof T, boolean>;
  entries(breakpoints).forEach(([key]) => (matches[key] = false));
  return matches;
};

export const checkMqSupported = () => {
  if (isServer) {
    return false;
  }

  if (!window.matchMedia) {
    return false;
  }

  return true;
};
