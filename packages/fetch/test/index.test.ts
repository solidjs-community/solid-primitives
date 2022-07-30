import { test, expect } from "vitest";
import { createRoot, createEffect, createSignal } from "solid-js";
import { createFetch } from "../src/fetch";
import {
  withAbort,
  withCatchAll,
  withRefetchEvent,
  withRetry,
  withTimeout
} from "../src/modifiers";
import { withCache, withCacheStorage } from "../src/cache";

const mockResponseBody = { ready: true };
const mockResponse = new Response(JSON.stringify(mockResponseBody), {
  headers: new Headers({ "content-type": "application/json" }),
  status: 200
});
const mockUrl = "https://test.url/ready.json";
const mockUrl2 = "https://test.url/notready.json";
let mockError: Error | undefined = undefined;
let expected: { input: RequestInfo; init?: RequestInit } = {
  input: mockUrl,
  init: undefined
};
const fetchMock: typeof fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> =>
  new Promise((resolve, reject) => {
    if (expected.input) {
      expect(input).toEqual(expected.input);
    }
    if (expected.init) {
      expect(init).toEqual(expected.init);
    }
    if (mockError) {
      reject(mockError);
    } else {
      resolve(mockResponse);
    }
  });

test("will fetch json data", () =>
  new Promise<void>(resolve => {
    createRoot(dispose => {
      const [ready] = createFetch(mockUrl, {
        fetch: fetchMock
      });
      createEffect(() => {
        const isReady = (ready() as any)?.ready;
        if (ready.error) {
          throw ready.error;
        }
        if (typeof isReady !== "undefined") {
          expect(isReady).toBe(true);
          dispose();
          resolve();
        }
      });
    });
  }));

test("will fetch text data", () =>
  new Promise<void>(resolve => {
    createRoot(dispose => {
      const [ready] = createFetch<typeof mockResponseBody>(mockUrl, {
        fetch: fetchMock,
        responseHandler: res => res.text()
      });
      createEffect(() => {
        const answer = ready();
        if (ready.error) {
          throw ready.error;
        }
        if (typeof answer !== "undefined") {
          expect(answer).toBe(JSON.stringify(mockResponseBody));
          dispose();
          resolve();
        }
      });
    });
  }));

test("will abort a request without an error", () =>
  createRoot(dispose => {
    const [ready, { abort }] = createFetch<typeof mockResponseBody>(mockUrl, { fetch: fetchMock }, [
      withAbort()
    ]);
    abort!();
    expect(ready.aborted).toBe(true);
    createEffect(() => {
      if (ready.error) {
        throw ready.error;
      }
    });
    return new Promise<void>(resolve =>
      window.setTimeout(() => {
        dispose();
        resolve();
      }, 20)
    );
  }));

test("will make a request error accessible otherwise", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      const fetchError = new Error("TypeError: failed to fetch");
      const [ready] = createFetch(() => mockUrl, {
        fetch: () => Promise.reject(fetchError)
      });
      createEffect(() => {
        if (ready.error) {
          expect(ready.error).toBe(fetchError);
          dispose();
          resolve();
        }
      });
    })
  ));

test("will not start a request with a requestinfo accessor returning undefined", () =>
  new Promise<void>((resolve, reject) => {
    createRoot(dispose => {
      const [url, setUrl] = createSignal<string>();
      const fetch = () =>
        url() === undefined
          ? Promise.reject(reject(new Error("called even though the url was undefined")))
          : Promise.resolve(mockResponse);
      const [ready] = createFetch(url, { fetch });
      createEffect(() => {
        ready();
        if (url() === undefined) {
          setUrl(mockUrl);
        } else {
          dispose();
          resolve();
        }
      });
    });
  }));

test("will abort the request on timeout and catchAll the error", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      const fetch = () =>
        new Promise<typeof mockResponse>(r => setTimeout(() => r(mockResponse), 1000));
      const [ready] = createFetch(mockUrl, { fetch }, [
        withTimeout(50),
        withAbort(),
        withCatchAll()
      ]);
      createEffect((iteration: number = 0) => {
        expect(ready.error).toEqual([undefined, new Error("timeout")][iteration]);
        if (iteration === 1) {
          dispose();
          resolve();
        }
        return iteration + 1;
      });
    })
  ));

test("retries request if fails on first try", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      let calls = 0;
      const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
      const fetch = () => {
        return calls++
          ? Promise.resolve(mockResponse)
          : Promise.reject(new Error("TypeError: Failed to fetch"));
      };
      const [ready] = createFetch<typeof mockResponseBody>(url, { fetch }, [withRetry(1, 0)]);
      createEffect((iteration: number = 0) => {
        const data = ready();
        if (iteration === 0) {
          setUrl(mockUrl);
        }
        if (iteration === 1 && data?.ready) {
          expect(calls).toBe(2);
          dispose();
          resolve();
        }
        return iteration + 1;
      });
    })
  ));

test("refetches request after visibility changes to visible", () =>
  new Promise<void>((resolve, reject) =>
    createRoot(dispose => {
      let calls = 0;
      const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
      const fetch = () => {
        calls++;
        return Promise.resolve(mockResponse);
      };
      const [ready] = createFetch<typeof mockResponseBody>(url, { fetch }, [withRefetchEvent()]);
      createEffect(() => {
        if (ready.error) {
          reject(ready.error);
        }
        const data = ready();
        if (!data) {
          setUrl(mockUrl);
        }
        if (data?.ready) {
          Object.defineProperty(document, "visibilityState", { get: () => "visible" });
          window.dispatchEvent(new Event("visibilitychange"));
        }
        if (calls === 2) {
          dispose();
          resolve();
        }
      });
    })
  ));

test("caches request instead of making them twice", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      let calls = 0;
      const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
      const cache = {};
      const fetch = () => {
        calls++;
        return Promise.resolve(mockResponse);
      };
      const [ready] = createFetch(url, { fetch }, [withCache({ cache, expires: 100000 })]);
      createEffect((iteration: number = 0) => {
        ready();
        if (iteration === 0) {
          setUrl(mockUrl);
        }
        if (iteration === 1) {
          setUrl(mockUrl2);
        }
        if (iteration === 2) {
          setUrl(mockUrl);
        }
        if (iteration === 3) {
          expect(calls).toBe(2);
          dispose();
          resolve();
        }
        return iteration + 1;
      });
    })
  ));

test("invalidates cached request", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      let calls = 0;
      const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
      const cache = {};
      const fetch = () => {
        calls++;
        return Promise.resolve(mockResponse);
      };
      const [ready] = createFetch(url, { fetch }, [withCache({ cache, expires: -1 })]);
      createEffect((iteration: number = 0) => {
        ready();
        if (iteration === 0) {
          setUrl(mockUrl);
        }
        if (iteration === 1) {
          setUrl(mockUrl2);
        }
        if (iteration === 2) {
          setUrl(mockUrl);
        }
        if (iteration === 3) {
          expect(calls).toBe(3);
          dispose();
          resolve();
        }
        return iteration + 1;
      });
    })
  ));

test("loads and saves cache to localStorage", () =>
  new Promise<void>(resolve =>
    createRoot(dispose => {
      let calls = 0;
      const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
      const cache = {};
      const fetch = () => {
        calls++;
        return Promise.resolve(mockResponse);
      };
      localStorage.setItem(
        "fetch-cache",
        JSON.stringify({
          [JSON.stringify({ url: mockUrl })]: {
            ts: new Date().getTime(),
            requestData: [mockUrl],
            data: mockResponseBody
          }
        })
      );
      const [ready] = createFetch(url, { fetch }, [
        withCache({ cache, expires: 10000 }),
        withCacheStorage()
      ]);
      createEffect((iteration: number = 0) => {
        ready();
        if (iteration === 0) {
          setUrl(mockUrl);
        }
        if (iteration === 1) {
          expect(calls).toBe(0);
          setUrl(mockUrl2);
        }
        if (iteration === 2) {
          expect(calls).toBe(1);
          setUrl(mockUrl);
        }
        if (iteration === 3) {
          const savedCache = localStorage.getItem("fetch-cache");
          expect(savedCache).toEqual(JSON.stringify(cache));
          expect(Object.keys(cache)).toHaveLength(2);
          dispose();
          resolve();
        }
        return iteration + 1;
      });
    })
  ));
