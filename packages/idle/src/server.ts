import * as API from ".";

export const createIdleTimer: typeof API.createIdleTimer = v => ({
  isIdle: () => false,
  isPrompted: () => false,
  reset: () => {},
  start: () => {},
  stop: () => {}
});
