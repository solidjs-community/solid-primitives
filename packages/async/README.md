<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=async" alt="Solid Primitives async">
</p>

# @solid-primitives/async

[![size](https://img.shields.io/badge/size-1.14_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/async)
[![version](https://img.shields.io/npm/v/@solid-primitives/async?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/async)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of primitives for handling asynchronous data as reactive memos — streaming responses, cancellable fetches, retrying, and aggregating incremental results:

- [`fromStream`](#fromstream) - wraps a fetch request to support web streams in memos or optimistic signals
- [`fromJSONStream`](#fromjsonstream) - wraps a fetch request returning a web stream containing (incomplete) JSON for the use in memos or optimistic signals
- [`makeAbortable`](#makeabortable) - sets up an AbortSignal with auto-abort on re-fetch or timeout
- [`createAbortable`](#createabortable) - like `makeAbortable`, but with automatic abort on cleanup
- [`makeRetrying`](#makeretrying) - wraps the fetcher to retry requests after a delay
- [`createAggregated`](#createaggregated) - aggregates the values of an accessor

## Installation

```bash
npm install @solid-primitives/async
# or
yarn add @solid-primitives/async
# or
pnpm add @solid-primitives/async
```

## `fromStream`

Turns a function returning a [Web Stream API `ReadableStream`](https://streams.spec.whatwg.org/#rs-class) (optionally wrapped in a `Promise`), or a streaming `Response`, into an async generator that buffers the stream and yields the accumulated text after every chunk. Node's `stream/web` `ReadableStream` is also accepted — useful during streaming SSR, since a plain (non-streaming) SSR pass only ever reads the final value anyway.

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal, Loading } from "solid-js";
import { fromStream } from "@solid-primitives/async";

// a ReadableStream that emits one word every 300ms
const wordStream = () => {
  const words = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr".split(" ");
  return new ReadableStream<string>({
    pull: controller =>
      new Promise<void>(resolve =>
        setTimeout(() => {
          const word = words.shift();
          if (word) controller.enqueue(word + " ");
          else controller.close();
          resolve();
        }, 300),
      ),
  });
};

function Demo() {
  const [run, setRun] = createSignal(0);
  const text = createMemo(() => {
    run();
    return fromStream(wordStream)();
  });
  return (
    <>
      <button onClick={() => setRun(n => n + 1)}>Restart stream</button>
      <Loading fallback={<p>Waiting for first chunk…</p>}>
        <p>{text()}</p>
      </Loading>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
// definition (ReadableStream includes Node's `stream/web` variant)
fromStream<Args extends any[]>(
  fetcher: (...args: Args) => Promise<Response | ReadableStream> | Response | ReadableStream
): (...args: Args) => AsyncGenerator<string, void, unknown>;

// on the client
const plainText = createMemo(fromStream(() => fetch(url())));

// on the server (streaming SSR only)
const readme = createMemo(fromStream(() => Readable.toWeb(createReadStream("README.md"))));
```

If the packets were very small and contained only a few words from lorem ipsum, the result would be (one line per update):

```
Lorem ipsum
Lorem ipsum dolor sit amet,
Lorem ipsum dolor sit amet, consetetur sadipscing
```

and so on. Usual HTTP packets can transmit ~1.4kb including headers, so expect multiple updates for larger data.

## `fromJSONStream`

The same as `fromStream`, but it auto-closes a partial JSON string on every chunk so it parses successfully even mid-object, instead of buffering plain text.

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal, For, Loading } from "solid-js";
import { fromJSONStream } from "@solid-primitives/async";

const names = ["fromStream", "fromJSONStream", "makeAbortable", "makeRetrying"];
const json = JSON.stringify(names.map(name => ({ name, package: "@solid-primitives/async" })));

// a ReadableStream that emits the JSON text in 8-character chunks
const chunkedStream = () => {
  let pos = 0;
  return new ReadableStream<string>({
    pull: controller =>
      new Promise<void>(resolve =>
        setTimeout(() => {
          if (pos < json.length) controller.enqueue(json.slice(pos, (pos += 8)));
          else controller.close();
          resolve();
        }, 100),
      ),
  });
};

function Demo() {
  const [run, setRun] = createSignal(0);
  const items = createMemo(() => {
    run();
    return fromJSONStream(chunkedStream)();
  });
  return (
    <>
      <button onClick={() => setRun(n => n + 1)}>Restart stream</button>
      <Loading fallback={<p>Waiting for parsable JSON…</p>}>
        <ul>
          <For each={items()}>
            {item => (
              <li>
                {item.name} {item.package}
              </li>
            )}
          </For>
        </ul>
      </Loading>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
// definition (ReadableStream includes Node's `stream/web` variant)
fromJSONStream<Args extends any[]>(
  fetcher: (...args: Args) => Promise<Response | ReadableStream> | Response | ReadableStream
): (...args: Args) => AsyncGenerator<any, void, unknown>;

// usage — cast the result to the shape you expect, since the parsed JSON is untyped
const answer = createMemo(fromJSONStream(() => fetch(url()))) as Accessor<MyResponseShape>;
```

The result looks like this:

```js
// current data
// parsed JSON

'[{"id":8429,"name":"fromStrea'
[{ id: 8429, name: "fromStrea" }]

'[{"id":8429,"name":"fromStream","description":"tu'
[{ id: 8429, name: "fromStream", description: "tu" }]

'[{"id":8429,"name":"fromStream","description":"turns web streams into'
[{ id: 8429, name: "fromStream", description: "turns web streams into" }]

'[{"id":8429,"name":"fromStream","description":"turns web streams into async iterator"},{"id":294'
[{ id: 8429, name: "fromStream", description: "turns web streams into async iterator" }, { id: 294 }]

'[{"id":8429,"name":"fromStream","description":"turns web streams into async iterator"},{"id":2947,"name":"fromJSONStream",'
[{ id: 8429, name: "fromStream", description: "turns web streams into async iterator" }, { id: 2947, name: "fromJSONStream }]

// and so on
```

## `makeAbortable`

Orchestrates `AbortController` creation and aborting of abortable fetchers, either on refetch, after a timeout, or when a parent signal aborts — depending on configuration:

```ts
// definition
function makeAbortable(options?: {
  autoAbort?: boolean; // default true
  timeout?: number;
  chainTo?: () => AbortSignal;
}): [
  signal: () => AbortSignal,
  abort: (reason?: string) => void,
  filterAbortError: (err: any) => void,
];

// usage
const [signal, abort, filterAbortError] = makeAbortable();
const data = createMemo(
  fromStream(() => fetch(url(), { signal: signal() }).catch(filterAbortError)),
);
// use `createAbortable` if you do not want manual cleanup:
onCleanup(abort);
```

- `signal()` always returns a _fresh_, not-yet-aborted `AbortSignal`; unless `options.autoAbort` is set to `false`, calling it also aborts the previously returned signal, if any
- `abort(reason?)` aborts the current signal, regardless of `autoAbort`
- if `timeout` is set, the signal aborts itself automatically after that many milliseconds
- if `chainTo` is set to another `makeAbortable`/`createAbortable` signal accessor, this signal aborts whenever that parent signal does (for any reason — manual `abort()`, `timeout`, or an `autoAbort`'d retry) — handy for cascading an abort down a chain of dependent requests
- `filterAbortError(err)` returns `undefined` for errors whose `.name` is `"AbortError"` (what `fetch` rejects with when its signal aborts) and re-throws everything else, so you can `.catch(filterAbortError)` without swallowing real failures

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal, isPending, Loading, onCleanup } from "solid-js";
import { makeAbortable } from "@solid-primitives/async";

const fruits = ["apple", "apricot", "banana", "blueberry", "cherry", "grape", "mango", "melon"];

// a slow, abortable fake search request
const search = (query: string, signal: AbortSignal) =>
  new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => resolve(fruits.filter(f => f.includes(query))), 800);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

function Demo() {
  const [query, setQuery] = createSignal("");
  const [signal, abort, filterAbortError] = makeAbortable();
  onCleanup(abort);
  // every keystroke aborts the previous, still pending request
  const results = createMemo(() => search(query(), signal()).catch(filterAbortError));
  return (
    <>
      <input value={query()} onInput={e => setQuery(e.currentTarget.value)} placeholder="Search…" />
      <button onClick={() => abort()}>Abort</button>
      <Loading fallback={<p>Searching…</p>}>
        <p>
          {results()?.join(", ") || "no matches"}
          {isPending(() => results()) && " (searching…)"}
        </p>
      </Loading>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## `createAbortable`

Takes the same options and returns the same tuple as `makeAbortable`, but also aborts the current signal automatically `onCleanup` — so it must be called within a reactive (owned) scope.

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal, Loading } from "solid-js";
import { createAbortable } from "@solid-primitives/async";

// a fake request that takes `ms` milliseconds unless aborted
const request = (ms: number, signal: AbortSignal) =>
  new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => resolve(`done after ${ms}ms`), ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("aborted", "AbortError"));
    });
  });

function Demo() {
  const [req, setReq] = createSignal({ ms: 500 });
  // aborts after 1s, and automatically when Demo is disposed
  const [signal, , filterAbortError] = createAbortable({ timeout: 1000 });
  const result = createMemo(() => request(req().ms, signal()).catch(filterAbortError));
  return (
    <>
      <button onClick={() => setReq({ ms: 500 })}>Fast request (500ms)</button>
      <button onClick={() => setReq({ ms: 2000 })}>Slow request (2000ms)</button>
      <Loading fallback={<p>Requesting…</p>}>
        <p>{result() ?? "aborted by 1s timeout"}</p>
      </Loading>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [signal, abort, filterAbortError] = createAbortable();
const data = createMemo(
  fromStream(() => fetch(url(), { signal: signal() }).catch(filterAbortError)),
);
// no need to call onCleanup(abort) yourself — it happens when the owning scope disposes
```

## `makeRetrying`

Wraps a fetcher and can catch errors and retry after a delay:

```ts
// definition
const fetcher: () => AsyncGenerator<any, void, unknown> = makeRetrying(
  () => fetch(url()).then(r => r.body),
  {
    delay: 1000, // number of Milliseconds to wait before retrying; default is 5s
    retries: 1, // number of times the request should be retried before throwing the last error; default is 3 times
  },
);
```

If you want to retry for an infinite number of times, you can set `options.retries` to `Infinity`.

```tsx repl
import { render } from "@solidjs/web";
import { createMemo, createSignal, isPending, Loading } from "solid-js";
import { makeRetrying } from "@solid-primitives/async";

function Demo() {
  const [run, setRun] = createSignal(0);
  const result = createMemo(() => {
    run();
    let attempts = 0;
    // fails twice, then succeeds — retried every 500ms
    const flaky = () =>
      ++attempts < 3
        ? Promise.reject(new Error("flaky"))
        : Promise.resolve(`succeeded on attempt ${attempts}`);
    return makeRetrying(flaky, { delay: 500 })();
  });
  return (
    <>
      <button onClick={() => setRun(n => n + 1)}>Fetch again</button>
      <Loading fallback={<p>Retrying…</p>}>
        <p>
          {result()}
          {isPending(() => result()) && " (retrying…)"}
        </p>
      </Loading>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## `createAggregated`

Aggregates every value emitted by an accessor into a growing memo, instead of replacing the previous value with each update:

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { createAggregated } from "@solid-primitives/async";

function Demo() {
  const [page, setPage] = createSignal(1);
  // every new page number is appended instead of replacing the previous one
  const pages = createAggregated(page, [] as number[]);
  return (
    <>
      <button onClick={() => setPage(p => p + 1)}>Load next page</button>
      <ul>
        <For each={pages() as number[]}>{p => <li>Page {p}</li>}</For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
// definition
function createAggregated<R, I extends R | R[]>(
  accessor: Accessor<R>,
  initialValue?: I,
  memoOptions?: MemoOptions<I | R | R[]>, // forwarded to the underlying createMemo
): Accessor<I | R | R[] | undefined>;

// usage
const pages = createAggregated(currentPage, []);
```

- if the aggregate so far is an Array, incoming values are appended to it
- if the aggregate so far is an Object, the incoming value is shallow-merged into it
- if the aggregate so far is a string, incoming string data is concatenated onto it
- otherwise the aggregate becomes an Array containing the previous and incoming values
- `null`/`undefined` values from the accessor are ignored and never overwrite an existing aggregate — so a still-pending accessor won't reset an already-started aggregation
- objects and arrays are re-created (shallow-copied) on every update, but the individual values are left untouched, so `<For>` works as expected
