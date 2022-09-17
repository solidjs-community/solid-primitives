import * as API from ".";

export const makeIdleTimer: typeof API.makeIdleTimer = v => ({
    isIdle: () => false,
    isPrompted: () => false,
    reset: () => {},
    start: () => {},
    stop: () => {},
});
