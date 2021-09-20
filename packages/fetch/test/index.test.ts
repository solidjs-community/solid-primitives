import { createRoot, createEffect } from 'solid-js';
import { createFetch } from '../src';

describe('createFetch', () => {
  const mockResponseBody = { ready: true }
  const mockResponse = new Response(JSON.stringify(mockResponseBody), {
    headers: new Headers({'content-type': 'application/json' }),
    status: 200    
  });
  const mockUrl = 'https://test.url/ready.json';
  let mockError: Error | undefined = undefined;
  let expected: { input: RequestInfo, init?: RequestInit } = {
    input: mockUrl,
    init: undefined,
  };
  const fetchMock: typeof fetch = (
    input: RequestInfo,
    init?: RequestInit
  ): Promise<Response> => new Promise((resolve, reject) => {
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
  test('will fetch json data', () => new Promise<void>((resolve) => {
    createRoot((dispose) => {
      const [ready] = createFetch<typeof mockResponseBody, undefined>(mockUrl, { fetch: fetchMock });
      createEffect(() => {
        const isReady = ready()?.ready
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
});
