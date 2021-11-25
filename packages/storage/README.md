---
Name: storage
Stage: 3
Package: "@solid-primitives/storage"
Primitives: createStorage, createCookieStorage, createAsyncStorage, createStorageSignal, createLocalStorage, createSessionStorage
Category: Browser APIs
---

# @solid-primitives/storage

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/storage?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/storage)
[![size](https://img.shields.io/npm/v/@solid-primitives/storage?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/storage)

Creates a primitive to reactively access both synchronous and asynchronous persistent storage APIs similar to localStorage.

## How to use it

`createStorage` is meant to wrap any localStorage-like API to be as accessible as a [solid store](https://www.solidjs.com/docs/latest/api#createstore). The main differences are

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
: an array of or a single localStorage-like storage API; default will be localStorage if it exists; an empty array or no API will not throw an error, but only ever get `null` and not actually persist anything

`prefix`
: a string that will be prefixed every key inside the API on set and get operations

`serializer / deserializer`
: a set of function to filter the input and output; the serializer takes an arbitrary object and returns a string, e.g. JSON.stringify, whereas the deserializer takes a string and returns the requested object again.

`options`
: for APIs that support options as third argument in the `getItem` and `setItem` method (see helper type `StorageWithOptions<O>`), you can add options they will receive on every operation.

---

There are a number of convenience Methods primed with common storage APIs and our own version to use cookies:

```ts
createLocalStorage();
createSessionStorage();
createCookieStorage();
```

---

### Asynchronous storage APIs

In case you have APIs that persist data on the server or via ServiceWorker in a [CookieStore](https://wicg.github.io/cookie-store/#CookieStore), you can wrap them into an `AsyncStorage` or `AsyncStorageWithOptions` API and use them with `createAsyncStorage`:

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
}] = createAsyncStorage({ api: CookieStoreAPI, prefix: 'my-app' });

await setStore('key', 'value');
await store.key; // 'value'
```

It works exactly like a synchronous storage, with the exception that you have to `await` every single return value. Once the CookieStore API becomes more prevalent, we will integrate support out of the box.

If you cannot use document.cookie, you can overwrite the entry point using the following tuple:

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

### Tools

If you want to build your own Storage and don't want to do a .clear() method youself:

```ts
const storageWithClearMethod = addClearMethod(storage_without_clear_method);
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release

1.0.0

First proper release of storage engine with CJS support.

1.0.1

Patch CJS support.

</details>
