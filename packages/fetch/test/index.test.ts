import "./setup";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot, createEffect, createSignal } from "solid-js";
import { createFetch, withAbort, withCache, withCatchAll, withTimeout } from "../src";

const test = suite("createFetch");

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
      assert.equal(input, expected.input);
    }
    if (expected.init) {
      assert.equal(init, expected.init);
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
          assert.is(isReady, true);
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
          assert.is(answer, JSON.stringify(mockResponseBody));
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
    abort();
    assert.is(ready.aborted, true);
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
          assert.is(ready.error, fetchError);
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

  test('will abort the request on timeout and catchAll the error', () => new Promise<void>((resolve) => createRoot((dispose) => {
    const fetch = () => new Promise<typeof mockResponse>((r) => setTimeout(() => r(mockResponse), 1000));
    const [ready] = createFetch(mockUrl, { fetch }, [withTimeout(50), withAbort(), withCatchAll()])
    createEffect((iteration: number = 0) => {
      assert.equal(ready.error, [undefined, new Error('timeout')][iteration])
      return iteration + 1;
    });
    createEffect((iteration: number = 0) => {
      ready();
      if (iteration === 1) {
        assert.is(ready(), undefined);
        assert.is(ready.aborted, true);
      }
      if (iteration === 2) {
        dispose();
        resolve();
      }
      return iteration + 1;
    });
  })));

test('caches request instead of making them twice', () => new Promise<void>((resolve) => createRoot((dispose) => {
  let calls = 0;
  const [url, setUrl] = createSignal(undefined, { equals: false });
  const cache = {}
  const fetch = () => { calls++; return Promise.resolve(mockResponse); };
  const [ready] = createFetch(url, { fetch }, [withCache({ cache })]);
  createEffect((iteration: number = 0) => {
    ready();
    if (iteration === 0) {
      setUrl(mockUrl);
    }
    if (iteration === 1) {
      setUrl(mockUrl)
    }
    if (iteration === 2) {
      setUrl(mockUrl)
    }
    if (iteration === 3) {
      assert.is(calls, 1);
      dispose();
      resolve();
    }
    return iteration + 1;
  });
})));

test.run();
