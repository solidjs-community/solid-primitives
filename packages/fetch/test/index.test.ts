import { render } from 'solid-testing-library';
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
  const fetchMock: typeof fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    if (expected.input) {
      expect(input).toEqual(expected.input);
    }
    if (expected.init) {
      expect(init).toEqual(expected.init);
    }    
    return mockError ? Promise.reject(mockError) : Promise.resolve(mockResponse);
  }
  test('will fetch json data', async () => {
    const Component = () => {
      const [ready] = createFetch<typeof mockResponseBody, undefined>(mockUrl, { fetch: fetchMock });
      return ready()?.ready
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    render(<Component />, container);
    await new Promise(r => setTimeout(r, 200));
    expect(container.innerHTML).toBe('true');
  });  

});
