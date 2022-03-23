# @solid-primitives/url

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/url?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/url)
[![version](https://img.shields.io/npm/v/@solid-primitives/url?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/url)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Solid Primitives providing reactive interfaces for dealing with Browser's location, URL and URLSearchParams.

Covered Interfaces:

- [`Location`](#Location) - Reactive Primitives and Utilities targeting the state of `window.location`.
- [`URL`](#URL) - Reactive URL interface.
- [`URLSearchParams`](#URLSearchParams) - Reactive URLSearchParams interface.

## Installation

```bash
npm install @solid-primitives/url
# or
yarn add @solid-primitives/url
```

## `Location`

Reactive Primitives and Utilities targeting the state of `window.location`.

### `createLocationState`

Creates a reactive `window.location` state.

The state will update whenever the location changes. And the location can be modified using provided setters methods, to push, replace or navigate to a new href.

#### Example usage:

```ts
const [state, { push }] = createLocationState();
state.href; // => "http://example.com"
push(p => ({
  href: p.href + "?foo=bar",
  hash: "heading1"
}));
```

#### Setter methods

`createLocationState` provides three different setter methods for updating the `window.location` state. All have the same interface, but cause different side-effects.

- `"push"` - uses `history.pushState`
- `"replace"` - uses `history.replaceState`
- `"navigate"` - overwrites location

#### Server fallback

As `location` won't probably be available when executing on the server, a fallback location state has to be provided. It could be done with the `fallback` argument, or by using `setLocationFallback` to set a global fallback.

```ts
const fallback = {
  hash: "",
  host: "example.com",
  hostname: "example.com",
  href: "http://example.com/",
  origin: "http://example.com",
  pathname: "/",
  port: "",
  protocol: "http:",
  search: ""
};

// with fallback argument:
const [state] = createLocationState(fallback);

// with setLocationFallback helper
// (set it before the first execution of the primitive)
setLocationFallback(fallback);
const [state] = createLocationState();
```

### `useSharedLocationState`

Reuses a shared-root [`createLocationState`](#createLocationState), or creates one if one is not active.

Use it instead of `createLocationState` to avoid recreating signals, computations and event-listeners with each used primitive.

It's interface is the same as [`createLocationState`](#createLocationState), but the `fallback` argument is not available, hance the fallback needs to be set using the `setLocationFallback` helper.

```ts
const [state, { push }] = useSharedLocationState();
state.href; // => "http://example.com"
push(p => ({
  href: p.href + "?foo=bar",
  hash: "heading1"
}));
```

### `updateLocation`

A non-reactive utility function.

Change window's location state, by pushing or replacing value in history stack, or by forcing a navigation to a new href.

It takes two params:

- `href` - new location's href
- `method` - `"push" | "replace" | "navigate"`

  - `"push"` - uses `history.pushState`
  - `"replace"` - uses `history.replaceState`
  - `"navigate"` - overwrites location

```ts
updateLocation("http://www.example.com?foo=bar", "push");
```

## `URL`

An reactive `URL` interface and primitives.

### `ReactiveURL`

The `ReactiveURL` interface represents an object providing reactive setters and getters used for managing object URLs.

It has the same interface as the `URL` class, but all getters are granularly reactive – cause computation updates only when it's value has changed.

As this is a reactive structure, it should be instanciated under a reactive root.

```ts
const url = new ReactiveURL("http://example.com");
url.host; // => "example.com"
url.search = "?foo=bar";
url.hash = "heading1";
url.search; // => "?foo=bar"
createEffect(() => {
  console.log(url.href);
});
```

The `ReactiveURL` is **NOT** extending the `URL` class, so `x instanceof URL` won't work.

#### searchParmas getter

Same as in `URL` class, the `ReactiveURL` class provides a `searchParmas` getter. It returns an instance of [`ReactiveSearchParams`](#ReactiveSearchParams) class – that is connected to the `ReactiveURL` instance.

```ts
const url = new ReactiveURL("http://example.com");
// searchParmas field can be destructured, as it's reference won't change
const { searchParmas } = url;

createEffect(() => {
  console.log(searchParmas.get("foo"));
});
url.search = "?foo=bar"; // will cause the effect to rerun
```

### `createURL`

Creates an instance of the [`ReactiveURL`](#ReactiveURL) class. The ReactiveURL interface represents an object providing reactive setters and getters used for managing object URLs.

```ts
const url = createURL("http://example.com");
url.host; // => "example.com"
url.search = "?foo=bar";
url.hash = "heading1";
url.search; // => "?foo=bar"
createEffect(() => {
  console.log(url.href);
});
```

### `createURLRecord`

Provides a `URL` instance as a reactive store.

```ts
const [url, setURL] = createURLRecord("http://example.com");
url.host; // => "example.com"
setURL(p => ({
  href: p.href + "?foo=bar",
  hash: "heading1"
}));
url.search; // => "?foo=bar"
```

## `URLSearchParams`

An reactive `URLSearchParams` interface, reactive primitives and utilities helping with working with URL search params and `window.location.search`.

### `ReactiveSearchParams`

A Reactive version of `URLSearchParmas` class. All the method reads are granular – cause reactive updates only when the value changes.

As this is a reactive structure, it should be instanciated under a reactive root.

```ts
const parmas = new ReactiveSearchParams("foo=1&=foo=2&bar=baz");
createEffect(() => {
  params.getAll("foo");
});
params.append("foo", "3");
```

`ReactiveSearchParams` is extending the `URLSearchParams` class, so `x instanceof URLSearchParams` could be used.

### `createSearchParams`

Creates an instance of the [`ReactiveSearchParams`](#ReactiveSearchParams) class.

```ts
const parmas = createSearchParams("foo=1&=foo=2&bar=baz");
```

### `createLocationSearchParams`

Provides a reactive record of `URLSearchParams` reflecting `window.location.search`. The record is granular, and updates whenever the search params in the Browser's URL change.

Additionally provides different setters to update the location's search params.

Options:

- `useSharedState` - use shared-root version of reactive location state. [(`useSharedLocationState`)](#usesharedlocationstate)

```ts
const [params, { push }] = createLocationSearchParams();
params.foo; // T: string | strgin[] | undefined
push(p => ({
  ...p,
  foo: p.foo + "bar",
  page: 123
}));
```

### `useSharedLocationSearchParams`

Reuses a shared-root [`createLocationSearchParams`](#createlocationsearchparams), or creates one if one is not active.

Use it instead of `createLocationSearchParams` to avoid recreating signals, computations and event-listeners with each used primitive.

```ts
const [params, { push }] = useSharedLocationSearchParams();
```

### `getSearchParamsRecord`

Relper for turning an `URLSearchParams` instance to a `SearchParamsRecord`.

```ts
const searchParams = new URLSearchParams("?foo=bar");
const record = getSearchParamsRecord(searchParams);
record; // => { foo: "bar" }
```

#### Setter methods

`createLocationSearchParams` provides three different setter methods for updating the `window.location` state. All have the same interface, but cause different side-effects.

- `"push"` - uses `history.pushState`
- `"replace"` - uses `history.replaceState`
- `"navigate"` - overwrites location

## Improvement ideas

###### (Ideas and PRs Welcome)

- [ ] Better reactive connection between `ReactiveURL` and `.searchParams` instance. (Currently writes trigger unnecessary updates)
- [ ] Router's hash mode support
- [ ] Option to set & get search parmas granularly in `createURLRecord` & `createLocationState`.
- [ ] Routes list

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-2 primitive.

</details>
