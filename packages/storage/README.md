# @solid-primitives/storage

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a primitive to reactively access both synchronous and asynchronous persistent storage APIs similar to localStorage.

## How to use it

```ts
const [store, setStore, {
    remove: (key: string) => void;
    clear: () => void;
    toJSON: () => ({ [key: string]: string });
}] = createStorage({ api: sessionStorage, prefix: 'my-app' });

setStore('key', 'value');
store.key; // 'value'

// other built-ins:
createLocalStorage();
createSessionStorage();
createCookieStorage();

// This also works with async storages (e.g. key-value-storages on the server):
const [store, setStore, {
    remove: (key: string) => void;
    clear: () => void;
    toJSON: () => ({ [key: string]: string });
}] = createAsyncStorage({ api: asyncStorage, prefix: 'my-app' });

await setStore('key', 'value');
await store.key; // 'value'

// Or if you're only interested in one value:
const [value, setValue] = createStorageSignal('value', { api: cookieStorage });
// you can also use createCookieStorageSignal
setValue('value');
value(); // 'value'

// If you want to build your own Storage and don't want to do a .clear() method youself:
const storageWithClearMethod = addClearMethod(storage_without_clear_method);
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release

</details>
