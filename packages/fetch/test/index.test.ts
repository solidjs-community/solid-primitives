import { createRoot, createEffect } from "solid-js";
import { createFetch } from "../src";

describe("createFetch", () => {
  const mockResponseBody = { ready: true };
  const mockResponse = new Response(JSON.stringify(mockResponseBody), {
    headers: new Headers({ "content-type": "application/json" }),
    status: 200
  });
  const mockUrl = "https://test.url/ready.json";
  let mockError: Error | undefined = undefined;
  let expected: { input: RequestInfo; init?: RequestInit } = {
    input: mockUrl,
    init: undefined
  };
  const fetchMock: typeof fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> =>
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
        const [ready] = createFetch<typeof mockResponseBody, undefined>(mockUrl, {
          fetch: fetchMock
        });
        createEffect(() => {
          const isReady = ready()?.ready;
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
        const [ready] = createFetch<typeof mockResponseBody, undefined>(mockUrl, {
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
      const [ready, { abort }] = createFetch<typeof mockResponseBody, undefined>(mockUrl, {
        fetch: fetchMock
      });
      abort();
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

  test("will make a request error accessible otherwise", () => new Promise<void>(resolve =>
    createRoot(dispose => {
      const fetchError = new Error('TypeError: failed to fetch');
      const [ready] = createFetch<typeof mockResponseBody, undefined>(mockUrl, {
        fetch: () => Promise.reject(fetchError)
      });      
      createEffect(() => {
        if (ready.error) {
          expect(ready.error).toBe(fetchError);
          dispose();
          resolve();
        }
      });
    })));
});
