/**
 * A reactive Solid store backed by a remote database, kept in sync via realtime
 * change events. Ships with a Supabase adapter ({@link supabaseAdapter}); write your
 * own {@link DbAdapter} to target other backends.
 *
 * @module
 */
import {
  createEffect,
  createResource,
  createSignal,
  createMemo,
  on,
  onCleanup,
  untrack,
  DEV,
} from "solid-js";
import { createStore, reconcile, type SetStoreFunction, type Store, unwrap } from "solid-js/store";
import { type RealtimePostgresChangesPayload, SupabaseClient } from "@supabase/supabase-js";

/** A single row of the remote table, as a plain record. */
export type DbRow = Record<string, any>;

/** Before/after snapshot of a row involved in an insert, update, or delete. */
export type DbAdapterUpdate<Row extends DbRow> = { old?: Partial<Row>; new?: Partial<Row> };

/** The kind of change a {@link DbAdapterUpdate} represents. */
export type DbAdapterAction = "insert" | "update" | "delete";

/** Predicate deciding whether an incoming realtime change should be applied to the store. */
export type DbAdapterFilter<Row extends DbRow> = (
  ev: { action: DbAdapterAction } & DbAdapterUpdate<Row>,
) => boolean;

/** Options accepted by {@link supabaseAdapter}. */
export type DbAdapterOptions<Row extends DbRow, Extras extends Record<string, any> = {}> = {
  /** The Supabase client used to query the table and subscribe to its realtime channel. */
  client: SupabaseClient;
  /** Optional filter applied to incoming realtime changes before they reach the store. */
  filter?: DbAdapterFilter<Row>;
  /** Name of the table to read and subscribe to. */
  table: string;
} & Extras;

/**
 * Backend binding consumed by {@link createDbStore}: signals for incoming realtime
 * changes, an initial fetch, and read-through methods used to persist local writes.
 */
export type DbAdapter<Row extends DbRow> = {
  insertSignal: () => DbAdapterUpdate<Row> | undefined;
  updateSignal: () => DbAdapterUpdate<Row> | undefined;
  deleteSignal: () => DbAdapterUpdate<Row> | undefined;
  init: () => Promise<{ data?: Row[]; error?: unknown }>;
  insert: (data: DbAdapterUpdate<Row>) => PromiseLike<any>;
  update: (data: DbAdapterUpdate<Row>) => PromiseLike<any>;
  delete: (data: DbAdapterUpdate<Row>) => PromiseLike<any>;
};

/** Error thrown by a {@link DbAdapter} write, annotated with the change that caused it. */
export type DbStoreError<Row extends DbRow> = Error & {
  data: DbAdapterUpdate<Row>;
  action: DbAdapterAction;
  server: boolean;
};

const createEventMemo = <Row extends DbRow>(
  eventBase: { readonly action: "insert" | "update" | "delete" },
  eventSignal: () => DbAdapterUpdate<Row> | undefined,
  filter?: DbAdapterFilter<Row>,
) =>
  createMemo((prev: DbAdapterUpdate<Row> | undefined) => {
    const data = eventSignal();
    const next = data ? Object.assign(eventBase, data) : undefined;
    if (!next || (filter && !filter(next))) return prev;
    return next;
  });

const supabaseHandleError =
  <Row extends DbRow>(data: DbAdapterUpdate<Row>, action: DbAdapterAction, server = false) =>
  ({ error }: { error: unknown | null }): Promise<void> =>
    error
      ? Promise.reject(
          Object.assign(
            error instanceof Error
              ? error
              : new Error(typeof error === "string" ? error : `Unknown error`, { cause: error }),
            { data, action, server },
          ),
        )
      : Promise.resolve();

/**
 * A {@link DbAdapter} backed by Supabase: fetches the initial rows with the
 * Supabase client and subscribes to `postgres_changes` on the table's realtime channel.
 *
 * ```ts
 * const adapter = supabaseAdapter({ client: supabase, table: "todos" });
 * const [todos, setTodos] = createDbStore({ adapter });
 * ```
 *
 * @param opts Client, table name, optional schema, and optional change filter.
 * @returns A {@link DbAdapter} ready to pass to {@link createDbStore}.
 */
export const supabaseAdapter = <Row extends DbRow>(
  opts: DbAdapterOptions<Row, { schema?: string }>,
): DbAdapter<Row> => {
  const [insertSignal, setInsertSignal] = createSignal<DbAdapterUpdate<Row>>();
  const [updateSignal, setUpdateSignal] = createSignal<DbAdapterUpdate<Row>>();
  const [deleteSignal, setDeleteSignal] = createSignal<DbAdapterUpdate<Row>>();
  const updateHandler = (ev: RealtimePostgresChangesPayload<Row>) => {
    if (ev.eventType === "INSERT") {
      setInsertSignal(ev);
    } else if (ev.eventType === "DELETE") {
      setDeleteSignal(ev);
    } else {
      setUpdateSignal(ev);
    }
  };
  const channel = opts.client
    .channel("schema-db-changes")
    .on("postgres_changes", { event: "*", schema: opts.schema || "public" }, updateHandler)
    .subscribe();
  onCleanup(() => channel.unsubscribe());
  return {
    insertSignal: createEventMemo({ action: "insert" }, insertSignal, opts.filter),
    updateSignal: createEventMemo({ action: "update" }, updateSignal, opts.filter),
    deleteSignal: createEventMemo({ action: "delete" }, deleteSignal, opts.filter),
    init: () =>
      Promise.resolve().then(() => opts.client.from(opts.table).select()) as Promise<{
        data?: Row[];
        error?: unknown;
      }>,
    insert: data =>
      opts.client
        .from(opts.table)
        .insert(data.new as DbRow)
        .then(supabaseHandleError(data, "insert", true)),
    update: data =>
      opts.client
        .from(opts.table)
        .update(data.new as DbRow)
        .eq("id", data.old?.id ?? data.new?.id)
        .then(supabaseHandleError(data, "update", true)),
    delete: data =>
      opts.client
        .from(opts.table)
        .delete()
        .eq("id", data.old?.id ?? data.new?.id)
        .then(supabaseHandleError(data, "delete", true)),
  };
};

/** Options for {@link createDbStore}. */
export type DbStoreOptions<Row extends DbRow> = {
  /** Backend binding providing the initial fetch and realtime change signals. */
  adapter: DbAdapter<Row>;
  /** Rows to populate the store with before the initial fetch resolves. */
  init?: Row[];
  /** Fields (e.g. `["id"]`) used to reconcile an optimistically-inserted row with the row echoed back by the adapter. */
  defaultFields?: readonly string[];
  /** Custom equality check used to diff rows when detecting local updates. Defaults to `===`. */
  equals?: (a: unknown, b: unknown) => boolean;
  /** Called when the initial fetch or an adapter write fails. Falls back to `console.error` in dev. */
  onError?: (err: DbStoreError<Row>) => void;
};

/**
 * Creates a Solid store synced with a remote table: local `set` calls are diffed
 * and persisted through the adapter, and incoming realtime changes are applied
 * back to the store.
 *
 * ```ts
 * const [todos, setTodos, { refetch }] = createDbStore({
 *   adapter: supabaseAdapter({ client: supabase, table: "todos" }),
 * });
 * setTodos(todos.length, { text: "buy milk" }); // persisted via adapter.insert
 * ```
 *
 * @param opts Adapter and store configuration.
 * @returns `[store, setStore, { refetch }]`.
 */
export const createDbStore = <Row extends DbRow>(
  opts: DbStoreOptions<Row>,
): [Store<Row[]>, SetStoreFunction<Row[]>, { refetch: () => void }] => {
  const insertions = new Set<Partial<Row>>();
  const [dbStore, setDbStore] = createStore<Row[]>(opts.init || []);
  const [dbInit, { refetch }] = createResource(opts.adapter.init);
  const equals = opts.equals || ((a, b) => a === b);
  const defaultFields = opts.defaultFields || ["id"];
  const onError = (error: DbStoreError<Row>) => {
    if (typeof opts.onError === "function") {
      opts.onError(error);
    } else if (DEV) {
      // oxlint-disable-next-line no-console
      console.error(error);
    }
    return Promise.resolve();
  };
  createEffect(() =>
    !dbInit.loading && dbInit.error
      ? opts.onError?.(dbInit.error)
      : dbInit()?.data?.length
        ? setDbStore(reconcile(dbInit()?.data!))
        : setDbStore(reconcile([])),
  );
  createEffect(
    on(opts.adapter.insertSignal, inserted => {
      if (!inserted?.new?.id) return;
      for (const row of insertions.values()) {
        if (
          Object.entries(inserted.new).some(
            ([key, value]) => !defaultFields.includes(key) && row[key] !== value,
          )
        )
          continue;
        const index = untrack(() =>
          dbStore.findIndex(cand =>
            Object.entries(cand).every(
              ([key, value]) => defaultFields.includes(key) || row[key] == value,
            ),
          ),
        );
        if (index !== -1) {
          // @ts-ignore
          setDbStore(index, inserted.new);
          insertions.delete(row);
          return;
        }
      }
      setDbStore(dbStore.length, inserted.new as Row);
    }),
  );
  createEffect(
    on(opts.adapter.updateSignal, update => {
      const updateId = update?.new?.id ?? update?.old?.id;
      if (updateId && Object.keys(update?.new || {}).length > 0) {
        const previousIndex = dbStore.findIndex(({ id }) => id === updateId);
        if (previousIndex > -1) {
          setDbStore(previousIndex, { ...dbStore[previousIndex], ...update!.new! } as Row);
        }
      }
    }),
  );
  createEffect(
    on(opts.adapter.deleteSignal, deletion => {
      const deletionId = deletion?.old?.id;
      if (deletionId) {
        setDbStore(reconcile(dbStore.filter(({ id }) => id !== deletionId)));
      }
    }),
  );

  const findRow = (rows: Row[], row: Row) =>
    rows.find(
      (candidate?: Row) =>
        candidate &&
        Object.entries(row).every(
          ([key, value]) => !(key in candidate) || candidate[key] === value,
        ),
    );
  const set = function (...args: any[]) {
    const prev = [...unwrap(dbStore)];
    const prevData: Map<Row, Row> = prev.reduce((map, item) => {
      map.set(item, structuredClone(item));
      return map;
    }, new Map<Row, Row>());
    const result = (setDbStore as any)(...args);
    const next = unwrap(dbStore);
    const deleted = prev.filter(row => !findRow(next, row));
    const inserted = next.filter(row => !findRow(prev, row));
    const updated: DbAdapterUpdate<Row>[] = [];
    next.forEach(row => {
      const prevRow = prevData.get(row);
      if (prevRow) {
        const updatedFields: Partial<Row> = {};
        for (const key in row) if (!equals(prevRow[key], row[key])) updatedFields[key] = row[key];
        for (const key in prevRow)
          if (!(key in updatedFields) && !equals(prevRow[key], row[key]))
            updatedFields[key] = row[key];
        if ("id" in row) {
          updated.push({ old: { id: row.id }, new: updatedFields } as any as DbAdapterUpdate<Row>);
        }
      }
    });
    prevData.clear();
    Promise.allSettled([
      ...deleted.map(row => {
        const id = "id" in row ? row.id : undefined;
        if (id) {
          return Promise.resolve()
            .then(() => opts.adapter.delete({ old: { id } as unknown as Partial<Row> }))
            .catch(error =>
              supabaseHandleError(
                { old: { id } as unknown as Partial<Row> },
                "delete",
              )({ error }).catch(onError),
            );
        }
      }),
      ...inserted.map((item?: Partial<Row>) => {
        if (!item) return;
        item = { ...unwrap(item), id: undefined };
        insertions.add(item);
        return Promise.resolve()
          .then(() => opts.adapter.insert({ new: item }))
          .catch(error =>
            supabaseHandleError({ new: item, old: {} }, "insert")({ error }).catch(onError),
          );
      }),
      ...updated.map(update =>
        Promise.resolve()
          .then(() => opts.adapter.update(update))
          .catch(error => supabaseHandleError(update, "update")({ error }).catch(onError)),
      ),
    ]);
    return result;
  };

  return [dbStore, set, { refetch }];
};
