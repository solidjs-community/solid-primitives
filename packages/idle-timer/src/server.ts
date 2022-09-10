import * as API from ".";

export const makeIdleTimer: typeof API.makeIdleTimer = v => ({
    isIdle: () => false,
    isPrompted: () => false,
    getSessionTime: () => 0,
    reset: () => {},
    start: () => {},
    stop: () => {},
});
