<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Storage" alt="Solid Primitives Storage">
</p>

# @solid-primitives/storage

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/storage?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/storage)
[![size](https://img.shields.io/npm/v/@solid-primitives/storage?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/storage)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Creates a primitive to reactively access both synchronous and asynchronous persistent storage APIs similar
to `localStorage`.

## Installation

```
npm install @solid-primitives/storage
# or
yarn add @solid-primitives/storage
```

## How to use it

`makePersisted` allows you to persist a signal or store in any synchronous or asynchronous Storage API:

```ts
const [signal, setSignal] = makePersisted(createSignal("initial"), {storage: sessionStorage});
const [store, setStore] = makePersisted(createStore({test: true}), {name: "testing"});
type PersistedOptions<Type, StorageOptions> = {
  // localStorage is default
  storage?: Storage | StorageWithOptions | AsyncStorage | AsyncStorageWithOptions,
  // only required for storage APIs with options
  storageOptions?: StorageOptions,
  // key in the storage API
  name?: "...",
  // JSON.stringify is the default
  serialize?: (value: Type) => value.toString(),
  // JSON.parse is the default
  deserialize?: (value: string) => Type(value),
  // sync API (see below)
  sync?: PersistenceSyncAPI
};
```

- if no storage is given in options, `localStorage` is used
- if no name is given in options, a unique identifier from `solid-js` will be the default
- initial values of signals or stores are not persisted, so they can be safely changed
- values persisted in asynchronous storage APIs will not overwrite already changed signals or stores
- setting a persisted signal to undefined or null will remove the item from the storage
- to use `makePersisted` with other state management APIs, you need some adapter that will project your API to either
  the output of `createSignal` or `createStore`

### Using `makePersisted` with resources

Instead of wrapping the resource itself, it is far simpler to use the `storage` option of the resource to provide a
persisted signal or [deep signal](../resource/#createdeepsignal):

```ts
const [resource] = createResource(fetcher, { storage: makePersisted(createSignal()) });
```

If you are using an asynchronous storage to persist the state of a resource, it might receive an update due to being
initialized from the storage before or after the fetcher resolved. If the initialization resolves after the fetcher, its
result is discarded not to overwrite more current data.

### Different storage APIs

#### LocalStorage, SessionStorage

In the browser, we already have `localStorage`, which persists values for the same hostname indefinitely,
and `sessionStorage`, which does the same for the duration of the browser session, but loses persistence after closing
the browser.

#### CookieStorage

As another storage, `cookieStorage` from this package can be used, which is a `localStorage`-like API to set cookies. It
will work in the browser and on solid-start, by parsing the `Cookie` and `Set-Cookie` header and altering
the `Set-Cookie` header. Using it in the server without solid-start will not cause errors, but reading and setting cookies
will not work, unless you supply `getRequestHeaders() => Headers` and `getResponseHeaders => Headers` to the options.

```ts
// for example, in express.js request and response headers can usually be accessed like this:
const cs = cookieStorage.withOptions({
  getRequestHeaders: () => req.headers,
  getResponseHeaders: () => res.headers,
});
```

> Please mind that `cookieStorage` **doesn't care** about the path and domain when reading cookies. This might cause issues
> when using multiple cookies with the same key, but different path or domain.

`cookieStorage` has been augmented with the `.withOptions` method that binds options to the other methods. This allows you
to use predefined options for your persisted state:

```ts
const [state, setState] = makePersisted(createSignal(), {
  storage: cookieStorage.withOptions({ expires: new Date(+new Date() + 3e10) }),
});
```

#### TauriStorage

[Tauri](https://tauri.app) is a lightweight run-time for desktop (and soon also mobile) applications utilizing web front-end frameworks. While it supports `localStorage` and `sessionStorage`, it also has its own store plugin with the benefit of improved stability. To use it, install the required modules both on the side of JavaScript and Rust after setting up the project with the help of their command-line interface:

```bash
npm run tauri add store
```

Also, it requires a few permissions in `capabilities/default.json`:

```js
{
  // other defaults
  "permissions": [
    // other permissions
    "store:allow-get",
    "store:allow-set",
    "store:allow-delete",
    "store:allow-keys",
    "store:allow-clear"
  ]
}
```

Lastly, initialize the plugin in the setup:

```rs
fn main() {
    tauri::Builder::default()
        // initialize store plugin:
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Once these preparations are finished, `tauriStorage(name?: string)` can be used as another storage option. To fallback to localStorage if the app does not run within tauri, you can check for `window.__TAURI_INTERNALS__`:

```ts
const storage = window.__TAURI_INTERNALS__ ? tauriStorage() : localStorage;
```

#### IndexedDB, WebSQL

There is also [`localForage`](https://localforage.github.io/localForage/), which uses `IndexedDB`, `WebSQL`
or `localStorage` to provide an asynchronous Storage API that can ideally store much more than the few Megabytes that
are available in most browsers.

#### Multiplexed storages

You may want to persist your state to multiple storages as a fallback solution (e.g. localStorage vs. cookieStorage so it
works offline and on the server).

In order to do so, you can use `multiplexStorage`:

```ts
const [mode, setMode] = makePersisted(createSignal("dark"), {
  name: "mode",
  storage: multiplexStorage(localStorage, cookieStorage),
});
```

If none of your storage APIs is asynchronous, the resulting API is synchronous, otherwise it is async. For the getItem
operation, the first storage that returns a valid value will be the source of truth. So you need to await deletion and
writing before you can rely on the result in case of asynchronous storages.

### Sync API

The storage API has an interesting functionality: if you set an item in one instance of the same page, other instances
are notified of the change via the storage event so they can elect to automatically update.

#### storageSync

With `storageSync`, you can use exactly this API in order to sync to external updates to the same storage.

```ts
const [state, setState] = makePersisted(createSignal(), { sync: storageSync });
```

#### messageSync

With `messageSync`, you can recreate the same functionality for other storages within the client using either the post message API
or broadcast channel API. If no argument is given, it is using post message, otherwise provide the broadcast channel as argument

```ts
const [state, setState] = makePersisted(createSignal(), {
  storage: customStorage,
  sync: messageSync(),
});
```

#### wsSync

With `wsSync`, you can create your synchronization API based on a web socket connection (either created yourself or by our
`@solid-primitives/websocket` package); this allows synchronization between client and server.

```ts
const [state, setState] = makePersisted(createSignal(), { sync: wsSync(makeWs(...)) });
```

#### multiplexSync

You can also multiplex different synchronization APIs using multiplexSync:

```ts
const [state, setState] = makePersisted(createSignal(), {
  sync: multiplexSync(storageSync, wsSync(ws)),
});
```

#### Custom synchronization API

If you want to create your own sync API, you can use the following pattern:

```ts
export type PersistenceSyncData = {
  key: string;
  newValue: string | null | undefined;
  timeStamp: number;
  url?: string;
};

export type PersistenceSyncCallback = (data: PersistenceSyncData) => void;

export type PersistenceSyncAPI = [
  /** subscribes to sync */
  subscribe: (subscriber: PersistenceSyncCallback) => void,
  update: (key: string, value: string | null | undefined) => void,
];
```

You can use APIs like Pusher or a WebRTC data connection to synchronize your state.

### Tools

If you want to build your own Storage and don't want to do a `.clear()` method yourself:

```ts
const storageWithClearMethod = addClearMethod(storage_without_clear_method);
```

If your storage API supports options and you want to add predefined options so it behaves like an API without options,
you can add a `.withOptions` method:

```ts
const customStorage = addWithOptionsMethod(storage_supporting_options);
const boundCustomStorage = customStorage.withOptions(myOptions);
```

---

### Deprecated primitives:

The previous implementation proved to be confusing and cumbersome for most people who just wanted to persist their
signals and stores, so they are now deprecated and will soon be removed from this package.

`createStorage` is meant to wrap any `localStorage`-like API to be as accessible as
a [Solid Store](https://www.solidjs.com/docs/latest/api#createstore). The main differences are

- that this store is persisted in whatever API is used,
- that you can only use the topmost layer of the object and
- that you have additional methods in an object as the third part of the returned tuple:

```ts
const [store, setStore, {
  remove: (key: string) => void;
  clear: () => void;
  toJSON: () => ({[key: string]: string });
}]
= createStorage({api: sessionStorage, prefix: 'my-app'});

setStore('key', 'value');
store.key; // 'value'
```

The props object support the following parameters:

`api`
: An array of or a single `localStorage`-like storage API; default will be `localStorage` if it exists; an empty array
or no API will not throw an error, but only ever get `null` and not actually persist anything

`prefix`
: A string that will be prefixed every key inside the API on set and get operations

`serializer / deserializer`
: A set of function to filter the input and output; the `serializer` takes an arbitrary object and returns a string,
e.g. `JSON.stringify`, whereas the `deserializer` takes a string and returns the requested object again.

`options`
: For APIs that support options as third argument in the `getItem` and `setItem` method (see helper
type `StorageWithOptions<O>`), you can add options they will receive on every operation.

---

There are a number of convenience Methods primed with common storage APIs and our own version to use cookies:

```ts
createLocalStorage();
createSessionStorage();
createCookieStorage();
```

---

#### Asynchronous storage APIs

In case you have APIs that persist data on the server or via `ServiceWorker` in
a [`CookieStore`](https://wicg.github.io/cookie-store/#CookieStore), you can wrap them into an asynchronous
storage (`AsyncStorage` or `AsyncStorageWithOptions` API) and use them with `createAsyncStorage`:

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
}
)
;

const [cookies, setCookie, {
  remove: (key: string) => void;
  clear: () => void;
  toJSON: () => ({[key: string]: string
})
;
}]
= createAsyncStorage({api: CookieStoreAPI, prefix: 'my-app', sync: false});

await setStore('key', 'value');
await store.key; // 'value'
```

It works exactly like a synchronous storage, with the exception that you have to `await` every single return value. Once
the `CookieStore` API becomes more prevalent, we will integrate support out of the box.

If you cannot use `document.cookie`, you can overwrite the entry point using the following tuple:

```ts
import {cookieStorage} from '@solid-primitives/storage';

cookieStorage._cookies = [object
:
{
  [name
:
  string
]:
  CookieProxy
}
,
name: string
]
;
```

If you need to abstract an API yourself, you can use a getter and a setter:

```ts
const CookieAbstraction = {
  get cookie() {
    return myCookieJar.toString()
  }
  set cookie(cookie) {
    const data = {};
    cookie.replace(/([^=]+)=(?:([^;]+);?)/g, (_, key, value) => {
      data[key] = value
    });
    myCookieJar.set(data);
  }
}
cookieStorage._cookies = [CookieAbstraction, 'cookie'];
```

---

`createStorageSignal` is meant for those cases when you only need to conveniently access a single value instead of full
access to the storage API:

```ts
const [value, setValue] = createStorageSignal("value", { api: cookieStorage });

setValue("value");
value(); // 'value'
```

As a convenient additional method, you can also use `createCookieStorageSignal(key, initialValue, options)`.

---

### Options

The properties of your `createStorage`/`createAsyncStorage`/`createStorageSignal` props are:

- `api`: the (synchronous or
  asynchronous) [Storage-like API](https://developer.mozilla.org/de/docs/Web/API/Web_Storage_API), default
  is `localStorage`
- `deserializer` (optional): a `deserializer` or parser for the stored data
- `serializer` (optional): a `serializer` or string converter for the stored data
- `options` (optional): default options for the set-call of Storage-like API, if supported
- `prefix` (optional): a prefix for the Storage keys
- `sync` (optional): if set to
  false, [event synchronization](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent) is disabled

## Demo

[Live Demo](https://primitives.solidjs.community/playground/storage) - [Sources](https://github.com/solidjs-community/solid-primitives/tree/main/packages/storage/dev)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
