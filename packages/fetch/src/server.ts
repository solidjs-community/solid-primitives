if (!globalThis.fetch) {
  Object.assign(globalThis, {
    fetch: (...args: any[]) => {
      try {
        const fetch = require("node-fetch");
        Object.assign(globalThis, { fetch });
        return fetch(...args);
      } catch (e) {
        Object.assign(globalThis, {
          fetch: () => {
            console.warn(
              '"\x1b[33m⚠️ package missing to run createFetch on the server.\n Please run:\x1b[0m\n\nnpm i node-fetch\n"'
            );
            Promise.reject();
          }
        });
        return Promise.reject();
      }
    }
  });
}

export { createFetch, FetchReturn, FetchOptions, RequestContext } from "./fetch";
export { withAbort, withCatchAll, withTimeout } from "./modifiers";
export { fetchRequest, axiosRequest } from "./request";
