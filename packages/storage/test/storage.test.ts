import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createAsyncStorage, createStorage, createStorageSignal } from "../src/storage";
import { AsyncStorage } from "../src/types";

const testCreateStorage = suite("createStorage");

testCreateStorage.before(context => {
  let data: Record<string, string> = {};
  context.mockStorage = {
    getItem: (key: string): string | null => data[key] ?? null,
    setItem: (key: string, value: string): void => {
      data[key] = value;
    },
    clear: () => {
      data = {};
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    key: (index: number): string => Object.keys(data)[index],
    get length(): number {
      return Object.keys(data).length;
    }
  };
});

testCreateStorage("creates a storage", ({ mockStorage }) => {
  const [storage, setStorage, { remove, clear }] = createStorage({ api: mockStorage });
  setStorage("test", "1");
  mockStorage.setItem("test2", "2");
  assert.is(storage.test, mockStorage.getItem("test"));
  assert.is(storage.test, "1");
  assert.is(storage.test2, "2");
  remove("test2");
  assert.is(storage.test2, null);
  clear();
  assert.is(mockStorage.length, 0);
});

testCreateStorage.run();

const testCreateAsyncStorage = suite<{
  mockAsyncStorage: AsyncStorage;
}>("createAsyncStorage");

testCreateStorage.before(context => {
  let data: Record<string, string> = {};
  context.mockAsyncStorage = {
    getItem: (key: string) => Promise.resolve(data[key] ?? null),
    setItem: (key: string, value: string) => {
      data[key] = value;
      return Promise.resolve();
    },
    clear: () => {
      data = {};
      return Promise.resolve();
    },
    removeItem: (key: string) => {
      delete data[key];
      return Promise.resolve();
    },
    key: (index: number) => Promise.resolve(Object.keys(data)[index]),
    get length(): number {
      return Object.keys(data).length;
    }
  };
});

testCreateStorage("creates an async storage", async ({ mockAsyncStorage }) => {
  const [storage, setStorage, { remove, clear }] = createAsyncStorage({ api: mockAsyncStorage });
  await setStorage("test", "1");
  await mockAsyncStorage.setItem("test2", "2");
  assert.is(await storage.test, await mockAsyncStorage.getItem("test"));
  assert.is(await storage.test, "1");
  assert.is(await storage.test2, "2");
  await remove("test2");
  assert.is(await storage.test2, null);
  await clear();
  assert.is(mockAsyncStorage.length, 0);
});

const testCreateStorageSignal = suite("createStorageSignal");

testCreateStorageSignal.before(context => {
  let data: Record<string, string> = {};
  context.mockStorage = {
    getItem: (key: string): string | null => data[key] ?? null,
    setItem: (key: string, value: string): void => {
      data[key] = value;
    },
    clear: () => {
      data = {};
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    key: (index: number): string => Object.keys(data)[index],
    get length(): number {
      return Object.keys(data).length;
    }
  };
});

testCreateStorageSignal("creates a signal", ({ mockStorage }) => {
  const [storageItem, setStorageItem] = createStorageSignal<string | null, undefined>(
    "test",
    null,
    { api: mockStorage }
  );
  assert.is(storageItem(), null);
  setStorageItem("1");
  assert.is(storageItem(), "1");
});
