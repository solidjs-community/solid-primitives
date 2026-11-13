<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=url" alt="Solid Primitives url">
</p>

# @solid-primitives/url

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![version](https://img.shields.io/npm/v/@solid-primitives/url?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/url)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive primitives for the Browser's `Location`, `URL`, and `URLSearchParams` interfaces.

> **Already using [Solid Router](https://docs.solidjs.com/solid-router)?** It already covers a lot of the same ground — reactive location, search params, and navigation — and is the better choice if you need routing anyway. These primitives are for when you want that reactivity without pulling in a router, e.g. in a non-routed app or a library.

- [`createLocationState`](#createlocationstate) — Reactive `window.location` state, with `push`/`replace`/`navigate` setters.
- [`useSharedLocationState`](#usesharedlocationstate) — Shared-root version of `createLocationState`.
- [`updateLocation`](#updatelocation) — Non-reactive helper to push, replace, or navigate to a new href.
- [`createURL`](#createurl) / [`ReactiveURL`](#reactiveurl) — A reactive `URL`-like object.
- [`createURLRecord`](#createurlrecord) — A `URL` instance as a reactive store.
- [`createSearchParams`](#createsearchparams) / [`ReactiveSearchParams`](#reactivesearchparams) — A reactive `URLSearchParams`-like object.
- [`createLocationSearchParams`](#createlocationsearchparams) — Reactive record of `window.location.search`.

## Installation

```bash
npm install @solid-primitives/url
# or
pnpm add @solid-primitives/url
# or
yarn add @solid-primitives/url
```

## `createLocationState`

Creates a reactive `window.location` state. The state updates whenever the location changes —
via back/forward navigation, a `#hash` change, or `history.pushState`/`replaceState` — and can be
modified using the provided setter methods.

```tsx repl
import { render } from "@solidjs/web";
import { createLocationState } from "@solid-primitives/url";

function Demo() {
  const [location, { push, replace }] = createLocationState();
  return (
    <>
      <button onClick={() => push("hash", "section-1")}>push #section-1</button>
      <button onClick={() => push({ search: "?page=2" })}>push ?page=2</button>
      <button onClick={() => replace({ search: "", hash: "" })}>reset</button>
      <p>search: {location.search || "(empty)"}</p>
      <p>hash: {location.hash || "(empty)"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createLocationState } from "@solid-primitives/url";

const [state, { push }] = createLocationState();
state.href; // => "http://example.com/"
push({ hash: "heading1" });
state.href; // => "http://example.com/#heading1"
```

### Setter methods

`createLocationState` provides three setter methods for updating the `window.location` state.
All have the same interface, but cause different side effects:

- `push` — uses `history.pushState`
- `replace` — uses `history.replaceState`
- `navigate` — overwrites `location.href`, forcing a full navigation

Each setter accepts either a partial record (or an updater function returning one), or a single
`(key, value)` pair:

```ts
push({ pathname: "/other", hash: "top" });
push(prev => ({ search: prev.search + "&page=2" }));
push("hash", "top");
```

### Server fallback

`location` isn't available on the server, so a fallback has to be provided — either per-call, or
globally with `setLocationFallback` (call it before the primitives that rely on it):

```ts
// fallback can be a href string, a URL instance, or a LocationState object
const [state] = createLocationState("http://example.com");

// or globally, once, before rendering:
setLocationFallback("http://example.com");
const [state] = createLocationState();
```

#### `setLocationFallback`

Sets the global server fallback; in the browser it's a no-op and the real `window.location` is used.

```tsx repl
import { render } from "@solidjs/web";
import { createLocationState, setLocationFallback } from "@solid-primitives/url";

// only used during SSR — in the browser the real location wins
setLocationFallback("https://example.com/from-fallback");

function Demo() {
  const [location, { push }] = createLocationState();
  return (
    <>
      <button onClick={() => push("hash", `n${Date.now() % 1000}`)}>push random hash</button>
      <p>href: {location.href}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## `useSharedLocationState`

Reuses a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot)
`createLocationState`, or creates one if one isn't active yet. Use it instead of
`createLocationState` to avoid recreating signals, computations, and event listeners for every
consumer. Its interface is the same, minus the `fallback` argument — use `setLocationFallback`
instead.

```tsx repl
import { render } from "@solidjs/web";
import { useSharedLocationState } from "@solid-primitives/url";

function HashLabel() {
  const [location] = useSharedLocationState();
  return <p>hash: {location.hash || "(empty)"}</p>;
}

function Demo() {
  const [, { push }] = useSharedLocationState();
  return (
    <>
      <button onClick={() => push("hash", `n${Date.now() % 1000}`)}>push random hash</button>
      <HashLabel />
      <HashLabel />
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [state, { push }] = useSharedLocationState();
```

## `updateLocation`

A non-reactive utility to push, replace, or navigate to a new href.

```tsx repl
import { render } from "@solidjs/web";
import { createLocationState, updateLocation } from "@solid-primitives/url";

// Resolve against the current href so it also works inside sandboxed iframes.
const withHash = (hash: string) => new URL(hash, window.location.href).href;

function Demo() {
  const [location] = createLocationState();
  return (
    <>
      <button onClick={() => updateLocation(withHash("#foo"), "push")}>push #foo</button>
      <button onClick={() => updateLocation(withHash("#bar"), "replace")}>replace with #bar</button>
      <p>hash: {location.hash || "(empty)"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
updateLocation("http://example.com?foo=bar", "push");
```

## `createURL`

Creates an instance of [`ReactiveURL`](#reactiveurl).

```tsx repl
import { render } from "@solidjs/web";
import { createURL } from "@solid-primitives/url";

function Demo() {
  const url = createURL("https://shop.example.com/products?sort=price");
  return (
    <>
      <button onClick={() => (url.pathname = "/cart")}>go to /cart</button>
      <button onClick={() => (url.hash = "reviews")}>set hash</button>
      <p>href: {url.href}</p>
      <p>pathname: {url.pathname}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createURL } from "@solid-primitives/url";

const url = createURL("http://example.com");
url.host; // => "example.com"
url.search = "?foo=bar";
createEffect(() => console.log(url.href));
```

## `ReactiveURL`

An object providing reactive setters and getters for managing a URL — same interface as the
native `URL` class, but every getter is granularly reactive, causing updates only when its value
has actually changed.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveURL } from "@solid-primitives/url";

function Demo() {
  const url = new ReactiveURL("https://shop.example.com/products?category=shoes");
  const { searchParams } = url;
  return (
    <>
      <button onClick={() => (url.search = "?category=boots")}>set url.search</button>
      <button onClick={() => searchParams.set("category", "sandals")}>set searchParams</button>
      <p>search: {url.search}</p>
      <p>category: {searchParams.get("category")}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

`ReactiveURL` does **not** extend `URL`, so `x instanceof URL` won't hold. As a reactive
structure, it should be instantiated under a reactive root (e.g. inside `createRoot` or a
component).

```ts
const url = new ReactiveURL("http://example.com");
url.host; // => "example.com"
url.search = "?foo=bar";
url.hash = "heading1";
createEffect(() => console.log(url.href));
```

### `searchParams`

Same as the native `URL` class, `ReactiveURL` provides a `searchParams` getter, returning an
instance of [`ReactiveSearchParams`](#reactivesearchparams) kept in sync with `url.search` in
both directions. The reference is stable, so it can be destructured freely.

```ts
const url = new ReactiveURL("http://example.com");
const { searchParams } = url;

createEffect(() => console.log(searchParams.get("foo")));
url.search = "?foo=bar"; // reruns the effect above
searchParams.set("foo", "baz"); // updates url.search to "?foo=baz"
```

## `createURLRecord`

Provides a `URL` instance as a reactive store.

```tsx repl
import { render } from "@solidjs/web";
import { createURLRecord } from "@solid-primitives/url";

function Demo() {
  const [url, setURL] = createURLRecord("https://example.com/docs");
  return (
    <>
      <button onClick={() => setURL("hash", `h${Date.now() % 1000}`)}>set hash</button>
      <button onClick={() => setURL({ pathname: "/blog", hash: "" })}>go to /blog</button>
      <p>href: {url.href}</p>
      <p>pathname: {url.pathname}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createURLRecord } from "@solid-primitives/url";

const [url, setURL] = createURLRecord("http://example.com");
url.host; // => "example.com"
setURL({ hash: "heading1" });
url.hash; // => "#heading1"
```

## `createSearchParams`

Creates an instance of [`ReactiveSearchParams`](#reactivesearchparams).

```tsx repl
import { render } from "@solidjs/web";
import { createSearchParams } from "@solid-primitives/url";

function Demo() {
  const params = createSearchParams("q=solid&page=1");
  return (
    <>
      <input value={params.get("q") ?? ""} onInput={e => params.set("q", e.currentTarget.value)} />
      <button onClick={() => params.set("page", String(Number(params.get("page")) + 1))}>
        next page
      </button>
      <p>?{params.toString()}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const params = createSearchParams("foo=1&foo=2&bar=baz");
```

## `ReactiveSearchParams`

A reactive version of the `URLSearchParams` class. Every read method is granular — it causes an
update only when the value it read has actually changed.

```tsx repl
import { render } from "@solidjs/web";
import { ReactiveSearchParams } from "@solid-primitives/url";

function Demo() {
  const params = new ReactiveSearchParams("foo=1&foo=2&bar=baz");
  return (
    <>
      <button onClick={() => params.append("foo", String(params.getAll("foo").length + 1))}>
        append foo
      </button>
      <button onClick={() => params.delete("foo")}>delete foo</button>
      <p>getAll("foo"): {params.getAll("foo").join(", ") || "(none)"}</p>
      <p>has("bar"): {String(params.has("bar"))}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

`ReactiveSearchParams` extends `URLSearchParams`, so `x instanceof URLSearchParams` holds. As a
reactive structure, it should be instantiated under a reactive root.

```ts
const params = new ReactiveSearchParams("foo=1&foo=2&bar=baz");
createEffect(() => console.log(params.getAll("foo")));
params.append("foo", "3");
```

## `createLocationSearchParams`

Provides a reactive record reflecting `window.location.search`, updating whenever the browser's
search params change, along with setter methods to update them.

```tsx repl
import { render } from "@solidjs/web";
import { createLocationSearchParams } from "@solid-primitives/url";

function Demo() {
  const [params, { push }] = createLocationSearchParams();
  return (
    <>
      <button onClick={() => push("tab", "overview")}>overview</button>
      <button onClick={() => push("tab", "details")}>details</button>
      <button onClick={() => push("tab", "reviews")}>reviews</button>
      <button onClick={() => push({})}>clear</button>
      <p>params.tab: {params.tab ?? "(none)"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createLocationSearchParams } from "@solid-primitives/url";

const [params, { push }] = createLocationSearchParams();
params.foo; // T: string | string[] | undefined
push({ ...params, page: "2" });
```

Passing `(name, value)` updates a single param, keeping the rest of the query string intact:

```ts
push("page", "3");
```

Options:

- `useSharedState` — use the shared-root version of the reactive location state (see
  [`useSharedLocationState`](#usesharedlocationstate)).

## `useSharedLocationSearchParams`

Reuses a shared-root `createLocationSearchParams`, or creates one if one isn't active.

```tsx repl
import { render } from "@solidjs/web";
import { useSharedLocationSearchParams } from "@solid-primitives/url";

function PageLabel() {
  const [params] = useSharedLocationSearchParams();
  return <p>page: {params.page ?? "1"}</p>;
}

function Demo() {
  const [, { push }] = useSharedLocationSearchParams();
  return (
    <>
      <button onClick={() => push("page", p => String(Number(p ?? "1") + 1))}>next page</button>
      <PageLabel />
      <PageLabel />
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [params, { push }] = useSharedLocationSearchParams();
```

## `getSearchParamsRecord`

A non-reactive helper turning a `URLSearchParams` instance (or a search string) into a plain
record — a single value for names that appear once, an array of values for names that repeat.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { getSearchParamsRecord } from "@solid-primitives/url";

function Demo() {
  const [query, setQuery] = createSignal("?foo=bar&tag=a&tag=b");
  return (
    <>
      <input value={query()} onInput={e => setQuery(e.currentTarget.value)} />
      <pre>{JSON.stringify(getSearchParamsRecord(query()), null, 2)}</pre>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { getSearchParamsRecord } from "@solid-primitives/url";

const record = getSearchParamsRecord("?foo=bar");
record; // => { foo: "bar" }
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.1.0

Rewritten for Solid 2.0. Adapted from the original design proposed in
[PR #77](https://github.com/solidjs-community/solid-primitives/pull/77).

</details>
