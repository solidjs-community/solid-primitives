import { describe, it, expect, vi } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createDbStore, supabaseAdapter } from "../src/index.js";
import {
  mockSupabaseClient,
  mockSupabaseClientData,
  mockSupabaseResponses,
  mockSupabaseSendEvent,
} from "./supabase-mock.js";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { reconcile } from "solid-js/store";

describe("supabaseAdapter", () => {
  it("resolves the initial data", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    return Promise.resolve()
      .then(() => adapter.init())
      .then(data => {
        expect(data).toEqual({ data: mockSupabaseClientData, error: null });
        cleanup();
      });
  });

  it("relays insertions to the insertSignal", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const insertionEvent: RealtimePostgresChangesPayload<any> = {
      eventType: "INSERT",
      schema: "*",
      old: {},
      new: { id: 1, data: "test" },
      table: "test",
      commit_timestamp: new Date().toUTCString(),
      errors: [],
    };
    return new Promise<void>(resolve => {
      createRoot(() =>
        createEffect(() => {
          const insertion = adapter.insertSignal();
          if (insertion?.new) {
            expect(insertion).toHaveProperty("action", "insert");
            expect(insertion).toHaveProperty("new", insertionEvent.new);
            resolve();
          }
        }),
      );
      mockSupabaseSendEvent(insertionEvent);
    }).finally(cleanup);
  });

  it("relays deletions to the deleteSignal", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const deletionEvent: RealtimePostgresChangesPayload<any> = {
      eventType: "DELETE",
      schema: "*",
      new: {},
      old: { id: 1, data: "test" },
      table: "test",
      commit_timestamp: new Date().toUTCString(),
      errors: [],
    };
    return new Promise<void>(resolve => {
      createRoot(() =>
        createEffect(() => {
          const deletion = adapter.deleteSignal();
          if (deletion?.old) {
            expect(deletion).toHaveProperty("action", "delete");
            expect(deletion).toHaveProperty("old", deletionEvent.old);
            resolve();
          }
        }),
      );
      mockSupabaseSendEvent(deletionEvent);
    }).finally(cleanup);
  });

  it("relays updates to the updateSignal", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const updateEvent: RealtimePostgresChangesPayload<any> = {
      eventType: "UPDATE",
      schema: "*",
      new: { data: "updated" },
      old: { id: 1 },
      table: "test",
      commit_timestamp: new Date().toUTCString(),
      errors: [],
    };
    return new Promise<void>(resolve => {
      createRoot(() =>
        createEffect(() => {
          const update = adapter.updateSignal();
          if (update?.old) {
            expect(update).toHaveProperty("action", "update");
            expect(update).toHaveProperty("old", updateEvent.old);
            resolve();
          }
        }),
      );
      mockSupabaseSendEvent(updateEvent);
    }).finally(cleanup);
  });

  it("relays the insertions to the database", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    return adapter.insert({ new: { data: "test" } }).then(cleanup);
  });

  it("collects errors during insertions to the database", async () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const originalResponse = mockSupabaseResponses.insert;
    mockSupabaseResponses.insert = Promise.resolve({ error: new Error("expected error") });
    const data = { new: {} };
    try {
      await adapter.insert(data);
      expect.fail("expected error missing");
    } catch (e) {
      if (e instanceof Error && e.message === "expected error missing") throw e;
      expect(e).toBeInstanceOf(Error);
      expect(e).toHaveProperty("action", "insert");
      expect(e).toHaveProperty("data", data);
    }
    mockSupabaseResponses.insert = originalResponse;
    cleanup();
  });

  it("relays the deletion to the database", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    return adapter.delete({ old: { id: 1 } }).then(cleanup);
  });

  it("collects errors during deletion to the database", async () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const originalResponse = mockSupabaseResponses.delete;
    mockSupabaseResponses.delete = Promise.resolve({ error: new Error("expected error") });
    const data = { old: {} };
    try {
      await adapter.delete(data);
      expect.fail("expected error missing");
    } catch (e) {
      if (e instanceof Error && e.message === "expected error missing") throw e;
      expect(e).toBeInstanceOf(Error);
      expect(e).toHaveProperty("action", "delete");
      expect(e).toHaveProperty("data", data);
    }
    mockSupabaseResponses.delete = originalResponse;
    cleanup();
  });

  it("relays the update to the database", () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    return adapter.update({ old: { id: 1 }, new: { data: "tested" } }).then(cleanup);
  });

  it("collects errors during update to the database", async () => {
    const [adapter, cleanup] = createRoot(dispose => [
      supabaseAdapter({
        client: mockSupabaseClient,
        table: "test",
      }),
      dispose,
    ]);
    const originalResponse = mockSupabaseResponses.update;
    mockSupabaseResponses.update = Promise.resolve({ error: new Error("expected error") });
    const data = { old: { id: 1 }, new: { test: "tested" } };
    try {
      await adapter.update(data);
      expect.fail("expected error missing");
    } catch (e) {
      if (e instanceof Error && e.message === "expected error missing") throw e;
      expect(e).toBeInstanceOf(Error);
      expect(e).toHaveProperty("action", "update");
      expect(e).toHaveProperty("data", data);
    }
    mockSupabaseResponses.update = originalResponse;
    cleanup();
  });
});

describe("createDbStore", () => {
  it("initializes the store", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              if (counter === 0) {
                expect(dbStore).toEqual([]);
              } else {
                expect(dbStore).toEqual(mockSupabaseClientData);
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("refetches from the database on calling refetch", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, _, { refetch }] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              if (counter < 1) {
                expect(dbStore).toEqual([]);
              } else if (counter == 1) {
                expect(dbStore).toEqual(mockSupabaseClientData);
                mockSupabaseClientData.push({ id: 3, data: "added" });
                expect(dbStore).not.toEqual(mockSupabaseClientData);
                refetch();
              } else {
                expect(dbStore).toEqual(mockSupabaseClientData);
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("inserts into the database from the store", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, setDbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            // @ts-ignore
            vi.mocked(mockSupabaseClient.insert).mockImplementationOnce((data, _options) => {
              expect(data).toEqual({ data: "inserted" });
              dispose();
              resolve();
              return mockSupabaseResponses.insert;
            });
            setDbStore(dbStore.length, { data: "inserted" });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("adds ids into the store from the database", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, setDbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              dbStore.length;
              if (counter === 0) {
                expect(dbStore).toEqual([]);
              } else if (counter === 1) {
                expect(dbStore).toEqual(mockSupabaseClientData);
                setDbStore(dbStore.length, { data: "inserted" });
              } else if (counter === 2) {
                expect(dbStore.at(-1)).toEqual({ id: undefined, data: "inserted" });
                mockSupabaseSendEvent({
                  eventType: "INSERT",
                  old: {},
                  new: { id: 5, data: "inserted" },
                  schema: "*",
                  commit_timestamp: new Date().toUTCString(),
                  table: "test",
                  errors: [],
                });
              } else if (counter === 3) {
                expect(dbStore.at(-1)).toEqual({ id: 5, data: "inserted" });
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("inserts into the store from the database", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              if (counter === 0) {
                expect(dbStore).toHaveLength(0);
              } else if (counter === 1) {
                expect(dbStore.length).toBeGreaterThan(0);
                mockSupabaseSendEvent({
                  eventType: "INSERT",
                  commit_timestamp: new Date().toUTCString(),
                  new: { id: 4, data: "inserted" },
                  old: {},
                  schema: "*",
                  table: "test",
                  errors: [],
                });
              } else if (counter === 2) {
                expect(dbStore.at(-1)).toEqual({ id: 4, data: "inserted" });
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("handles errors during insertion into the database", () => {
    const originalResponse = mockSupabaseResponses.insert;
    const errorCause = { message: "server connection lost" };
    mockSupabaseResponses.insert = Promise.resolve({ error: errorCause });
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, setDbStore] = createDbStore<{ id: number; data: string }>({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
              onError: error => {
                try {
                  expect(error).toBeInstanceOf(Error);
                  expect(error.toString()).toBe("Error: Unknown error");
                  expect(error.cause).toEqual(errorCause);
                  expect(error.data).toEqual({ new: { id: undefined, data: "inserted" }, old: {} });
                  expect(error.action).toEqual("insert");
                  expect(error.server).toBe(false);
                } catch (e) {
                  dispose();
                  reject(e);
                }
                dispose();
                resolve();
              },
            });
            setDbStore(dbStore.length, { data: "inserted" });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    ).finally(() => {
      mockSupabaseResponses.insert = originalResponse;
    });
  });

  it.sequential("updates the database from the store", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [_, setDbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
              init: [{ id: 1, data: "not yet updated" }],
            });
            // @ts-ignore
            vi.mocked(mockSupabaseClient.eq).mockImplementationOnce((key, value) => {
              expect(key).toBe("id");
              expect(value).toBe(1);
              dispose();
              resolve();
              return mockSupabaseResponses.update;
            });
            // @ts-ignore
            vi.mocked(mockSupabaseClient.update).mockImplementationOnce(data => {
              expect(data).toEqual({ data: "updated" });
              return mockSupabaseClient;
            });
            setDbStore(0, { data: "updated" });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("handles errors during updates of the database", () => {
    const originalResponse = mockSupabaseResponses.update;
    const errorCause = { message: "server connection lost" };
    mockSupabaseResponses.update = Promise.resolve({ error: errorCause });
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [_, setDbStore] = createDbStore<{ id: number; data: string }>({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
              init: mockSupabaseClientData,
              onError: error => {
                try {
                  expect(error).toBeInstanceOf(Error);
                  expect(error.toString()).toBe("Error: Unknown error");
                  expect(error.cause).toEqual(errorCause);
                  expect(error.data).toEqual({ new: { data: "updated" }, old: { id: 1 } });
                  expect(error.action).toEqual("update");
                  expect(error.server).toBe(false);
                } catch (e) {
                  dispose();
                  reject(e);
                }
                dispose();
                resolve();
              },
            });
            setDbStore(0, { data: "updated" });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    ).finally(() => {
      mockSupabaseResponses.update = originalResponse;
    });
  });

  it.skip("updates the store from the database", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              // subscribe the effect to the data so all updates can be captured.
              JSON.stringify(dbStore);
              if (counter === 0) {
                expect(dbStore).toHaveLength(0);
              } else if (counter === 1) {
                expect(dbStore.length).toBeGreaterThan(0);
                mockSupabaseSendEvent({
                  eventType: "UPDATE",
                  commit_timestamp: new Date().toUTCString(),
                  new: { data: "updated" },
                  old: { id: 1 },
                  schema: "*",
                  table: "test",
                  errors: [],
                });
              } else if (counter === 2) {
                expect(dbStore[0]).toEqual({ id: 1, data: "updated" });
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });

  it.sequential("deletes from the database from the store", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, setDbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
              init: [{ id: 1, data: "not yet deleted" }],
            });
            // @ts-ignore
            vi.mocked(mockSupabaseClient.eq).mockImplementationOnce((key, value) => {
              expect(key).toBe("id");
              expect(value).toBe(1);
              dispose();
              resolve();
              return mockSupabaseResponses.delete;
            });
            // @ts-ignore
            setDbStore(dbStore.length - 1, undefined);
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });
  
  it.skip("deletes from the store from the database", () => {
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore] = createDbStore({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
            });
            createEffect((counter: number = 0) => {
              // subscribe the effect to the data so all updates can be captured.
              JSON.stringify(dbStore);
              if (counter === 0) {
                expect(dbStore).toHaveLength(0);
              } else if (counter === 1) {
                expect(dbStore.length).toBeGreaterThan(0);
                mockSupabaseSendEvent({
                  eventType: "DELETE",
                  commit_timestamp: new Date().toUTCString(),
                  new: {},
                  old: { id: 1 },
                  schema: "*",
                  table: "test",
                  errors: [],
                });
              } else if (counter === 2) {
                expect(dbStore[0]).toEqual({ id: 2, data: "two" });
                dispose();
                resolve();
              }
              return counter + 1;
            });
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    );
  });
  
  it.skip("handles error during deletion", () => {
    const originalResponse = mockSupabaseResponses.delete;
    const errorCause = { message: "server connection lost" };
    mockSupabaseResponses.delete = Promise.resolve({ error: errorCause });
    return createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          try {
            const [dbStore, setDbStore] = createDbStore<{ id: number; data: string }>({
              adapter: supabaseAdapter({ client: mockSupabaseClient, table: "test" }),
              init: mockSupabaseClientData,
              onError: error => {
                try {
                  expect(error).toBeInstanceOf(Error);
                  expect(error.toString()).toBe("Error: Unknown error");
                  expect(error.cause).toEqual(errorCause);
                  expect(error.data).toEqual({ old: { id: 1 } });
                  expect(error.action).toEqual("delete");
                  expect(error.server).toBe(false);
                } catch (e) {
                  dispose();
                  reject(e);
                }
                dispose();
                resolve();
              },
            });
            setDbStore(reconcile(dbStore.filter(({ id }) => id !== 1)));
          } catch (e) {
            dispose();
            reject(e);
          }
        }),
    ).finally(() => {
      mockSupabaseResponses.delete = originalResponse;
    });
  });
});
