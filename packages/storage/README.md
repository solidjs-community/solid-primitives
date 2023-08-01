<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Storage" alt="Solid Primitives Storage">
</p>

# @solid-primitives/storage

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/storage?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/storage)
[![size](https://img.shields.io/npm/v/@solid-primitives/storage?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/storage)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Creates a primitive to reactively access both synchronous and asynchronous persistent storage APIs similar to `localStorage`.

## Installation

```
npm install @solid-primitives/storage
# or
yarn add @solid-primitives/storage
```

## How to use it

`makePersisted` allows you to persist a signal or store in any synchronous or asynchronous Storage API:

```ts
const [signal, setSignal] = makePersisted(createSignal("initial"), { storage: sessionStorage });
const [store, setStore] = makePersisted(createStore({ test: true }), { name: "testing" });
type PersistedOptions<Type, StorageOptions> = {
  // localStorage is defualt
  storage?: Storage | StorageWithOptions | AsyncStorage | AsyncStorageWithOptions,
  // only required for storage APIs with options
  storageOptions?: StorageOptions,
  // key in the storage API
  name?: "...",
  // JSON.stringify is the default
  serializer?: (value: Type) => value.toString(),
  // JSON.parse is the default
  deserializer?: (value: string) => Type(value),
};
```

- if no storage is given in options, `localStorage` is used
- if no name is given in options, a unique identifier from `solid-js` will be the default
- initial values of signals or stores are not persisted, so they can be safely changed
- values persisted in asynchronous storage APIs will not overwrite already changed signals or stores
- setting a persisted signal to undefined or null will remove the item from the storage
- to use `makePersisted` with other state management APIs, you need some adapter that will project your API to either the output of `createSignal` or `createStore`

### Using `makePersisted` with resources

Instead of wrapping the resource itself, it is far simpler to use the `storage` option of the resource to provide a persisted signal or [deep signal](../resource/#createdeepsignal):

```ts
const [resource] = createResource(fetcher, { storage: makePersisted(createSignal()) });
```

If you are using an asynchronous storage to persist the state of a resource, it might receive an update due to being initialized from the storage before or after the fetcher resolved. If the initialization resolves after the fetcher, its result is discarded not to overwrite more current data.

### Different storage APIs

In the browser, we already have `localStorage`, which persists values for the same hostname indefinitely, and `sessionStorage`, which does the same for the duration of the browser session, but loses persistence after closing the browser.

As another storage, `cookieStorage` from this package can be used, which is a `localStorage`-like API to set cookies. It will work in the browser and also allows reading cookies on solid-start. Using it in the server without solid-start will not cause errors (unless you are using stackblitz), but instead emit a warning message. You can also supply your own implementations of `cookieStorage._read(key)` and `cookieStorage._write(key, value, options)` if neither of those fit your need.

If you are not using solid-start or are using stackblitz and want to use cookieStorage on the server, you can supply optional getRequest (either something like useRequest from solid-start or a function that returns the current request) and setCookie options.

There is also [`localForage`](https://localforage.github.io/localForage/), which uses `IndexedDB`, `WebSQL` or `localStorage` to provide an asynchronous Storage API that can ideally store much more than the few Megabytes that are available in most browsers.

---

### Deprecated primitives:

The previous implementation proved to be confusing and cumbersome for most people who just wanted to persist their signals and stores, so they are now deprecated.

`createStorage` is meant to wrap any `localStorage`-like API to be as accessible as a [Solid Store](https://www.solidjs.com/docs/latest/api#createstore). The main differences are

- that this store is persisted in whatever API is used,
- that you can only use the topmost layer of the object and
- that you have additional methods in an object as the third part of the returned tuple:

```ts
const [store, setStore, {
  remove: (key: string) => void;
  clear: () => void;
  toJSON: () => ({ [key: string]: string });
}] = createStorage({ api: sessionStorage, prefix: 'my-app' });

setStore('key', 'value');
store.key; // 'value'
```

The props object support the following parameters:

`api`
: An array of or a single `localStorage`-like storage API; default will be `localStorage` if it exists; an empty array or no API will not throw an error, but only ever get `null` and not actually persist anything

`prefix`
: A string that will be prefixed every key inside the API on set and get operations

`serializer / deserializer`
: A set of function to filter the input and output; the `serializer` takes an arbitrary object and returns a string, e.g. `JSON.stringify`, whereas the `deserializer` takes a string and returns the requested object again.

`options`
: For APIs that support options as third argument in the `getItem` and `setItem` method (see helper type `StorageWithOptions<O>`), you can add options they will receive on every operation.

---

There are a number of convenience Methods primed with common storage APIs and our own version to use cookies:

```ts
createLocalStorage();
createSessionStorage();
createCookieStorage();
```

---

#### Asynchronous storage APIs

In case you have APIs that persist data on the server or via `ServiceWorker` in a [`CookieStore`](https://wicg.github.io/cookie-store/#CookieStore), you can wrap them into an asynchronous storage (`AsyncStorage` or `AsyncStorageWithOptions` API) and use them with `createAsyncStorage`:

```ts
type CookieStoreOptions = {
  path: string;
  domain: string;
  expires: DOMTimeStamp;
  sameSite: "None" | "Lax" | "Strict"
}
const CookieStoreAPI: AsyncStorageWithOptions<CookieStoreOptions> = {
  getItem: (key) => cookieStore.get(key),
  getAll: () => cookieStore.getAll(),
  setItem: (key: string, value: string, options: CookieStoreOptions = {}) => cookieStore.set({
    ...options, name, value
  }),
  removeItem: (key) => cookieStore.delete(key),
  clear: async () => {
    const all = await cookieStore.getAll();
    for (const key of all) {
      await cookieStore.delete(key);
    }
  },
  key: async (index: number) => {
    const all = await cookieStore.getAll();
    return Object.keys(all)[index];
  }
});

const [cookies, setCookie, {
    remove: (key: string) => void;
    clear: () => void;
    toJSON: () => ({ [key: string]: string });
}] = createAsyncStorage({ api: CookieStoreAPI, prefix: 'my-app', sync: false });

await setStore('key', 'value');
await store.key; // 'value'
```

It works exactly like a synchronous storage, with the exception that you have to `await` every single return value. Once the `CookieStore` API becomes more prevalent, we will integrate support out of the box.

If you cannot use `document.cookie`, you can overwrite the entry point using the following tuple:

```ts
import { cookieStorage } from '@solid-primitives/storage';

cookieStorage._cookies = [object: { [name: string]: CookieProxy }, name: string];
```

If you need to abstract an API yourself, you can use a getter and a setter:

```ts
const CookieAbstraction = {
  get cookie() { return myCookieJar.toString() }
  set cookie(cookie) {
    const data = {};
    cookie.replace(/([^=]+)=(?:([^;]+);?)/g, (_, key, value) => { data[key] = value });
    myCookieJar.set(data);
  }
}
cookieStorage._cookies = [CookieAbstraction, 'cookie'];
```

---

`createStorageSignal` is meant for those cases when you only need to conveniently access a single value instead of full access to the storage API:

```ts
const [value, setValue] = createStorageSignal("value", { api: cookieStorage });

setValue("value");
value(); // 'value'
```

As a convenient additional method, you can also use `createCookieStorageSignal(key, initialValue, options)`.

---

### Options

The properties of your `createStorage`/`createAsyncStorage`/`createStorageSignal` props are:

- `api`: the (synchronous or asynchronous) [Storage-like API](https://developer.mozilla.org/de/docs/Web/API/Web_Storage_API), default is `localStorage`
- `deserializer` (optional): a `deserializer` or parser for the stored data
- `serializer` (optional): a `serializer` or string converter for the stored data
- `options` (optional): default options for the set-call of Storage-like API, if supported
- `prefix` (optional): a prefix for the Storage keys
- `sync` (optional): if set to false, [event synchronization](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent) is disabled

### Tools

If you want to build your own Storage and don't want to do a `.clear()` method yourself:

```ts
const storageWithClearMethod = addClearMethod(storage_without_clear_method);
```

## Demo

[Live Demo](https://primitives.solidjs.community/playground/storage) - [Sources](https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage/dev)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
