import * as API from ".";

export const makeTimer = API.makeTimer;

export const createTimer: typeof API.createTimer = () => {};

export const createTimeoutLoop: typeof API.createTimeoutLoop = () => {};

export const createPolled: typeof API.createPolled = <T>(
  fn: (prev: T | undefined) => T,
  timeout: API.TimeoutSource,
  prev?: T
) => {
  const value = fn(prev);
  return () => value;
};

export const createIntervalCounter: typeof API.createIntervalCounter = () => () => 0;
