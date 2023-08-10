import "./setup";
import { test, expect, describe, vitest, vi } from "vitest";
import { createRoot, createEffect, createSignal } from "solid-js";
import { createFetch } from "../src/fetch.js";
import {
  withAbort,
  withAggregation,
  withCatchAll,
  withRefetchEvent,
  withRetry,
  withTimeout,
} from "../src/modifiers.js";
import { withCache, withCacheStorage, withRefetchOnExpiry } from "../src/cache.js";

const mockResponseBody = { ready: true };
const mockResponse = new Response(JSON.stringify(mockResponseBody), {
  headers: new Headers({ "content-type": "application/json" }),
  status: 200,
});
const mockUrl = "https://test.url/ready.json";
const mockUrl2 = "https://test.url/notready.json";

describe("fetch primitive", () => {
  test("will fetch json data", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        const fetchMock = () => Promise.resolve(mockResponse);
        const [ready] = createFetch(mockUrl, { fetch: fetchMock });
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
        const fetchMock = () =>
          Promise.resolve(
            new Response("it works", { headers: new Headers({ "Content-Type": "text/plain" }) }),
          );
        const [ready] = createFetch<string>(mockUrl, { fetch: fetchMock });
        createEffect(() => {
          const answer = ready();
          if (ready.error) {
            throw ready.error;
          }
          if (typeof answer !== "undefined") {
            expect(answer).toBe("it works");
            dispose();
            resolve();
          }
        });
      });
    }));

  test("will abort a request without an error", () => {
    const { ready, abort, dispose } = createRoot(dispose => {
      const [ready, { abort }] = createFetch(
        mockUrl,
        { fetch: () => new Promise<Response>(() => {}) },
        [withAbort()],
      );
      return { ready, abort, dispose };
    });

    abort!();
    expect(ready.aborted).toBe(true);
    expect(ready.error).toEqual(undefined);

    dispose();
  });

  test("will make a request error accessible otherwise", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const fetchError = new Error("TypeError: failed to fetch");
        const fetchMock = () => Promise.reject(fetchError);
        const [ready] = createFetch(() => mockUrl, {
          fetch: fetchMock,
        });
        createEffect(() => {
          if (ready.error) {
            expect(ready.error).toBe(fetchError);
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("will not start a request with a request info accessor returning undefined", () =>
    new Promise<void>((resolve, reject) => {
      createRoot(dispose => {
        const [url, setUrl] = createSignal<string>();
        const fetchMock = () =>
          url() === undefined
            ? Promise.reject(reject(new Error("called even though the url was undefined")))
            : Promise.resolve(mockResponse);
        const [ready] = createFetch(url, { fetch: fetchMock });
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

  test("will abort the request on timeout and catchAll the error", async () => {
    vi.useFakeTimers();

    let captured_error: unknown = null;

    const dispose = createRoot(dispose => {
      const [ready] = createFetch(mockUrl, { fetch: () => new Promise<Response>(() => {}) }, [
        withTimeout(50),
        withAbort(),
        withCatchAll(),
      ]);

      createEffect(() => {
        captured_error = ready.error;
      });

      return dispose;
    });

    expect(captured_error).toEqual(undefined);

    await vi.advanceTimersByTimeAsync(100);

    expect(captured_error).toEqual(new Error("timeout"));

    dispose();
    vi.useRealTimers();
  });

  test("retries request if fails on first try", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined);
        const fetchMock = () => {
          return calls++
            ? Promise.resolve(mockResponse)
            : Promise.reject(new Error("TypeError: Failed to fetch"));
        };
        const [ready] = createFetch<typeof mockResponseBody>(url, { fetch: fetchMock }, [
          withRetry(1, 0),
        ]);
        createEffect((iteration: number = 0) => {
          const data = ready();
          if (iteration === 0) {
            setUrl(mockUrl);
          }
          if (data?.ready) {
            expect(calls).toBe(2);
            dispose();
            resolve();
          }
          return iteration + 1;
        });
      }),
    ));

  test("re-fetches request after a set event", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const fetchMock = () => {
          calls++;
          return Promise.resolve(mockResponse);
        };
        const [ready] = createFetch<typeof mockResponseBody>(url, { fetch: fetchMock }, [
          withRefetchEvent({ on: ["refetch"] }),
        ]);
        createEffect(() => {
          const data = ready.error ? undefined : ready();
          if (!data) {
            setUrl(mockUrl);
          }
          if (data?.ready && calls === 1) {
            window.dispatchEvent(new Event("refetch"));
          }
          if (calls === 2) {
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("aggregates numbers", () =>
    new Promise<void>((resolve, reject) =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const fetchMock = () =>
          Promise.resolve(
            new Response("" + calls++, {
              headers: new Headers({ "Content-type": "application/json" }),
            }),
          );
        const [numbers] = createFetch<number | number[]>(url, { fetch: fetchMock }, [
          withAggregation(),
        ]);
        createEffect(() => {
          const data = numbers.error ? undefined : numbers();
          if (!data || typeof data === "number") {
            setUrl(mockUrl);
          } else {
            try {
              expect(data).toEqual([0, 1]);
            } catch (e) {
              reject(e);
            }
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("aggregates strings", () =>
    new Promise<void>((resolve, reject) =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const fetchMock = () =>
          Promise.resolve(
            new Response('"' + calls++ + '"', {
              headers: new Headers({ "Content-type": "application/json" }),
            }),
          );
        const [strings] = createFetch<string>(url, { fetch: fetchMock }, [withAggregation()]);
        createEffect(() => {
          const data = strings.error ? undefined : strings();
          if (!data || data === "0") {
            setUrl(mockUrl);
          } else {
            try {
              expect(data).toBe("01");
            } catch (e) {
              reject(e);
            }
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("aggregates arrays", () =>
    new Promise<void>((resolve, reject) =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const fetchMock = () =>
          Promise.resolve(
            new Response("[" + calls++ + "]", {
              headers: new Headers({ "Content-type": "application/json" }),
            }),
          );
        const [array] = createFetch<number[]>(url, { fetch: fetchMock }, [withAggregation()]);
        createEffect(() => {
          const data = array.error ? undefined : array();
          if (!data || data.length === 1) {
            setUrl(mockUrl);
          } else {
            try {
              expect(data).toEqual([0, 1]);
            } catch (e) {
              reject(e);
            }
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("aggregates objects", () =>
    new Promise<void>((resolve, reject) =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const fetchMock = () =>
          Promise.resolve(
            new Response('{ "' + calls++ + '": true }', {
              headers: new Headers({ "Content-type": "application/json" }),
            }),
          );
        const [array] = createFetch<Record<string, boolean>>(url, { fetch: fetchMock }, [
          withAggregation(),
        ]);
        createEffect(() => {
          const data = array.error ? undefined : array();
          if (!data || !data["1"]) {
            setUrl(mockUrl);
          } else {
            try {
              expect(data).toEqual({ "0": true, "1": true });
            } catch (e) {
              reject(e);
            }
            dispose();
            resolve();
          }
        });
      }),
    ));

  test("caches request instead of making them twice", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const cache = {};
        const fetchMock = () => {
          calls++;
          return Promise.resolve(mockResponse);
        };
        const [ready] = createFetch(url, { fetch: fetchMock }, [
          withCache({ cache, expires: 100000 }),
        ]);
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
      }),
    ));

  test("invalidates cached request", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const cache = {};
        const fetchMock = () => {
          calls++;
          return Promise.resolve(mockResponse);
        };
        const [ready] = createFetch(url, { fetch: fetchMock }, [withCache({ cache, expires: -1 })]);
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
      }),
    ));

  test("re-fetches after expiry", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        vitest.useFakeTimers();
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const cache = {};
        const fetchMock = () => {
          calls++;
          return Promise.resolve(mockResponse);
        };
        const [ready] = createFetch(url, { fetch: fetchMock }, [
          withCache({ cache, expires: 10000 }),
          withRefetchOnExpiry(),
        ]);
        createEffect((iteration: number = 0) => {
          ready();
          if (iteration === 0) {
            setUrl(mockUrl);
          }
          if (iteration === 1) {
            vitest.advanceTimersByTime(10010);
          }
          if (iteration === 2) {
            expect(calls).toBe(2);
            dispose();
            resolve();
          }
          return iteration + 1;
        });
      }),
    ));

  test("loads and saves cache to localStorage", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        let calls = 0;
        const [url, setUrl] = createSignal<string | undefined>(undefined, { equals: false });
        const cache = {};
        const fetchMock = () => {
          calls++;
          return Promise.resolve(mockResponse);
        };
        localStorage.setItem(
          "fetch-cache",
          JSON.stringify({
            [JSON.stringify({ url: mockUrl })]: {
              ts: new Date().getTime(),
              requestData: [mockUrl],
              data: mockResponseBody,
            },
          }),
        );
        const [ready] = createFetch(url, { fetch: fetchMock }, [
          withCache({ cache, expires: 10000 }),
          withCacheStorage(),
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
      }),
    ));
});
