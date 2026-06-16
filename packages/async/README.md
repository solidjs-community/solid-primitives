<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=async" alt="Solid Primitives async">
</p>

# @solid-primitives/async

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/async?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/async)
[![version](https://img.shields.io/npm/v/@solid-primitives/async?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/async)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of primitves for handling of asynchronous memos, optimistic signals, stores and actions:

- [`fromStream`](#fromStream) - wraps a fetch request to support web streams in memos or optimistic signals
- [`fromJSONStream`](#fromJSONStream) - wraps a fetch request returning a web stream containing (incomplete) JSON for the use in memos or optimistic signals
- [`makeAbortable`](#makeabortable) - sets up an AbortSignal with auto-abort on re-fetch or timeout
- [`createAbortable`](#createabortable) - like `makeAbortable`, but with automatic abort on cleanup
- [`makeRetrying`](#makeretrying) - wraps the fetcher to retry requests after a delay
- [`createAggregated`](#createAggregated) - aggregates the values of an accessor

## Installation

```bash
npm install @solid-primitives/async
# or
yarn add @solid-primitives/async
# or
pnpm add @solid-primitives/async
```

## `fromStream`

Turns a function returning a [Web Stream API ReadableStream](https://streams.spec.whatwg.org/#rs-class) or a streaming response directly or in a promise into an async iterator function that buffers the stream and updates with each data package. Node.js Web Streams are also supported, but will only work on streaming SSR.
 

```ts
// definition
fromStream<Args extends any[]>(
  webStreamOrResponse: (...args: Args) => ReadableStream | Response
): (...args: Args) => AsyncGenerator<string, void, unknown>;

// on the client
const plainText = createMemo(fromStream(() => fetch(url())));

// on the server
const readme = createMemo(fromStream(Readable.toWeb(createReadStream('README.md'))));
```

If the packages were very small and contained only a few words from lorem ipsum, the result would be (one line per update):

```
Lorem ipsum
Lorem ipsum dolor sit amet,
Lorem ipsum dolor sit amet, consetetur sadipscing
```

and so on. Usual HTTP packets can transmit ~1.4kb including headers, so expect mutliple updates for larger data.

## `fromJSONStream`

The same as `fromStream`, but it auto-closes a partial JSON string to allow for successful parsing.

```ts
// definition
fromStream<Args extends any[], JSON extends any>(
  webStreamOrResponse: (...args: Args) => ReadableStream | Response
): (...args: Args) => AsyncGenerator<JSON, void, unknown>;

// usage
const answer = createMemo(fromJSONStream(() => fetch(url())));
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

Orchestrates AbortController creation and aborting of abortable fetchers, either on refetch or after a timeout, depending on configuration:

```ts
// definition
const [
  signal: AbortSignal,
  abort: () => void,
  filterErrors: <E>(err: E) => E instanceof AbortError ? void : E
] = makeAbortable({
  timeout?: 10000,
  noAutoAbort?: true,
});

// usage
const [signal, abort, filterErrors] = makeAbortable();
const data = createMemo(fromStream(() => fetch(url(), { signal: signal() }).catch(filterErrors));
// use `createAbortable` if you do not want manual cleanup:
onCleanup(abort);
```

* The signal function always returns a signal that is not yet aborted; if noAutoAbort is not set to true, calling it will also abort a previous signal, if present
* The abort callback will always abort the current signal
* If timeout is set, the signal will be aborted after that many Milliseconds
* The filterErrors function can be used to filter out abort errors

## `createAbortable`

This function does exactly the same as makeAbortable, but also automatically aborts on cleanup. Only use within a reactive scope.

## `makeRetrying`

Wraps a fetcher and can catch errors and retry after a delay:

```ts
// definition
const fetcher: () => AsyncGenerator<any, void, unknown> = makeRetrying(
  () => fetch(url()).then(r => r.body),
  {
    delay: 1000, // number of Milliseconds to wait before retrying; default is 5s
    retries: 1, // number of times a rest should be repeated before throwing the last error; default is 3 times
  }
);
```

If you want to retry for an infinite number of times, you can set `options.retries` to `Infinity`.

## `createAggregated`

Aggregates the output of any accessor/memo:

```ts
const aggregated: Accessor<T> = createAggregated(
  accessor: Accessor<T>, initialValue?: T | U
);
const pages = createAggregated(currentPage, []);
```

* `null` will not overwrite `undefined`
* If the previous value is an Array, incoming values will be appended
* If any of the values are Objects, the current one will be shallow-merged into the previous one
* If the previous value is a string, more string data will be appended
* Otherwise the incoming data will be put into an array
* Objects and Arrays are re-created on each operation, but the values will be left untouched, so `<For>` should work fine
