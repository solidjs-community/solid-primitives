<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=db-store" alt="Solid Primitives db-store">
</p>

# @solid-primitives/db-store

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/db-store?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/db-store)
[![version](https://img.shields.io/npm/v/@solid-primitives/db-store?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/db-store)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A primitive that creates a synchronized store from a database:

`createDbStore` - creates a store synchronized to a database.
`supabaseAdapter` - adapter for [supabase](https://supabase.com/) database connections to synchronize stores from.

## Installation

```bash
npm install @solid-primitives/db-store
# or
yarn add @solid-primitives/db-store
# or
pnpm add @solid-primitives/db-store
```

## How to use it

```ts
const [dbStore, setDbStore] = createDbStore({
  adapter: supabaseAdapter(client),
  table: 'todos',
  filter: ({ userid }) => userid === user.id,
  onError: handleErrors,
});
```

The store is automatically initialized and optimistically updated both ways. Due to how databases work, the store can only ever contain an array of entries.

> [!WARNING]
> Since the order of items in the database cannot be guaranteed, the same is true for the items in the store.

> [!NOTE]
> It can take some time for the database editor to show updates. They are processed a lot faster.

### Setting preliminary IDs

The `id` field needs to be set by the database, so even if you set it, it needs to be overwritten in any case. It is not required to set it for your fields manually; one can also treat its absence as a sign that an insertion is not yet done in the database.

### Handling errors

If any change could not be successfully committed to the database, the `onError` handler is called with an Error. If the caught error was an error itself, it is used directly, else what was encountered will be set as cause for an Error "unknown error". The error will also be augmented with a "data" property containing the update, an "action" property containing "insert", "update" or "delete" and a "server" flag property that is true if the error happened while sending data to the server.

### Write your own adapter

Your adapter must have the following properties:

```tsx
export type DbAdapterUpdate<Row extends DbRow> =
  { old?: Partial<Row>, new?: Partial<Row> };

export type DbAdapter<Row> = {
  insertSignal: () => DbAdapterUpdate<Row> | undefined,
  updateSignal: () => DbAdapterUpdate<Row> | undefined,
  deleteSignal: () => DbAdapterUpdate<Row> | undefined,
  init: () => Promise<Row[]>,
  insert: (data: DbAdapterUpdate<Row>) => PromiseLike<any>,
  update: (data: DbAdapterUpdate<Row>) => PromiseLike<any>,
  delete: (data: DbAdapterUpdate<Row>) => PromiseLike<any>
};
```

## Demo

[Working demonstration](https://primitives.solidjs.community/playground/db-store/) (requires Supabase account)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Plans

This is an early draft; in the future, more adapters are planned: mongodb, prism, firebase, aws?


