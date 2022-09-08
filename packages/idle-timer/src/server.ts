import * as API from ".";

export const makeUserIdleTimer: typeof API.makeUserIdleTimer = v => ({
    isIdle: () => false,
    isPrompted: () => false,
    getSessionTime: () => 0,
    reset: () => {},
    start: () => {},
    stop: () => {},
});
