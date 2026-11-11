<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Storage" alt="Solid Primitives Storage">
</p>

# @solid-primitives/storage

[![size](https://img.shields.io/badge/size-2.29_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/storage)
[![size](https://img.shields.io/npm/v/@solid-primitives/storage?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/storage)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Creates a primitive to reactively access both synchronous and asynchronous persistent storage APIs similar
to `localStorage`.

## Installation

```
npm install @solid-primitives/storage
# or
yarn add @solid-primitives/storage
# or
pnpm add @solid-primitives/storage
```

## How to use it

`makePersisted` allows you to persist a signal or store in any synchronous or asynchronous Storage API:

```ts
const [signal, setSignal, init] = makePersisted(createSignal("initial"), {storage: sessionStorage});
const [store, setStore, init] = makePersisted(createStore({test: true}), {name: "testing"});
type PersistedOptions<Type, StorageOptions> = {
  // localStorage is default
  storage?: Storage | StorageWithOptions | AsyncStorage | AsyncStorageWithOptions | LocalForage,
  // only required for storage APIs with options
  storageOptions?: StorageOptions,
  // key in the storage API
  name?: "...",
  // defer initialization in order to avoid hydration mismatches in SSR settings
  hydrated?: true,
  // JSON.stringify is the default
  serialize?: (value: Type) => value.toString(),
  // JSON.parse is the default
  deserialize?: (value: string) => Type(value),
  // sync API (see below)
  sync?: PersistenceSyncAPI,
  // merge stored data onto the initial value instead of replacing it (see below)
  merge?: boolean | ((stored: Type, initial: Type) => Type),
};
```

- if no storage is given in options, `localStorage` is used
- if no name is given in options, a unique identifier from `solid-js` will be the default
- initial values of signals or stores are not persisted, so they can be safely changed
- values persisted in asynchronous storage APIs will not overwrite already changed signals or stores
- setting a persisted signal to undefined or null will remove the item from the storage
- to use `makePersisted` with other state management APIs, you need some adapter that will project your API to either
  the output of `createSignal` or `createStore`
- using `makePersisted` in an SSR scenario where you have different values on the server and the client might lead to hydration mismatches; use the `hydrated` option to defer the initialization so both values are the same

The fourth returned value is a `dispose` function. Call it to unsubscribe from sync events and cancel pending initialization. Cleanup is explicit; to tie it to a Solid owner, register it with `onCleanup`:

```ts
const [value, setValue, init, dispose] = makePersisted(createSignal("initial"));
onCleanup(dispose);
```

Custom sync subscriptions can return an unsubscribe function, which `dispose` will call.

### Keeping defaults for new keys with `merge`

By default, a stored value replaces the initial value completely. If you later add keys to the initial value of a store
(or an object in a signal), users with older persisted data would not get them. Use the `merge` option to apply the
stored value on top of the initial value instead:

```ts
// Type
merge?: boolean | ((stored: T, initial: T) => T);
// Example
// storage contains {"theme":"dark"} from an older version of the app
const [settings, setSettings] = makePersisted(
  createStore({ theme: "light", fontSize: 14 }),
  { name: "settings", merge: true },
);
settings.fontSize; // 14 - the default is kept
settings.theme; // "dark" - the stored value wins

// custom merge, e.g. to fill in defaults for array items
const [todos, setTodos] = makePersisted(createStore({ items: [] as Todo[] }), {
  name: "todos",
  merge: (stored, initial) => ({
    ...initial,
    ...stored,
    items: stored.items.map(item => ({ done: false, ...item })),
  }),
});
```

- `merge: true` deep-merges plain objects; arrays and all other stored values replace the default as a whole, and keys
  only present in the storage are kept
- the merge is always done onto the initial value (captured when `makePersisted` is called), both for the initial load
  and for values received from the `sync` API, so keys removed elsewhere are not resurrected from the current state
- the merged defaults are not written to the storage until the next write, just like initial values
- it works together with `hydrated` and asynchronous storages
- if the initial value is still pending when `makePersisted` is called (an async `createSignal`, `createOptimistic` or
  store), there are no defaults to merge onto: `merge: true` uses the stored data as is, and a merge function receives
  `undefined` as `initial`

### Using `makePersisted` with Loading

In case you are using an asynchronous storage and want the initialisation mesh into Suspense instead of mixing it with Show, we provide the output of the initialisation as third part of the returned tuple:

```ts
const [state, setState, init] = makePersisted(createStore({}), {
  name: "state",
  storage: localForage,
});
// run the memo so it hits the Loading boundary
createMemo(() => init)();
```

Now Loading should be blocked until the initialisation is resolved.

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

> HTTP headers are limited to 32kb, each header itself is limited to 16kb. So depending on your current headers, the space in `cookieStorage` is rather small. If the overall space is exceeded, subsequent requests will fail. We have no mechanism to prevent that, since we cannot infer all headers that the browser will set.

> Browsers do not support most UTF8 and UTF16 characters in Cookies, so `cookieStorage` encodes those characters that are not supported using `encodeURIComponent`. To save space, only those characters not supported by all Browsers will be encoded.

#### LocalForage

LocalForage uses indexedDB or WebSQL if available to greatly increase the size of what can be stored. Just drop it in as a storage (only supported in the client):

```ts
import { isServer } from "@solidjs/web";
import { makePersisted } from "@solid-primitives/storage";
import localforage from "localforage";

const [state, setState] = makePersisted(createSignal(), {
  storage: !isServer ? localforage : undefined,
});
```

Keep in mind that it will only run on the client, so unless you have

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
import { tauriStorage } from "@solid-primitives/storage/tauri";

const storage = window.__TAURI_INTERNALS__ ? tauriStorage() : localStorage;
```

#### Object storage

This package also provides a way to create a storage API wrapper for an object called `makeObjectStorage(object)`. This is especially useful as a server fallback if you want to store the data in your user session or database object:

```ts
const [state, setState] = createPersisted(createSignal(), {
  storage: globalThis.localStorage ?? makeObjectStorage(session.userState),
});
```

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
operation, the first storage (in the order they were passed) that returns a valid value will be the source of truth,
regardless of which storage responds first. A storage that rejects is skipped; only if no storage returns a value is the
first rejection passed on. So you need to await deletion and writing before you can rely on the result in case of
asynchronous storages.

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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
