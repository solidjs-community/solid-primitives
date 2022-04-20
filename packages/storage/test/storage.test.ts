import { createRoot } from "solid-js";
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
      const oldValue = data[key];
      data[key] = value;
      window.dispatchEvent(
        Object.assign(new Event("storage"), {
          key,
          newValue: value,
          oldValue,
          storageArea: context.mockStorage,
          url: window.document.URL
        })
      );
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

testCreateStorage("creates a storage", ({ mockStorage }) => createRoot((dispose) => {
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
  dispose();
}));

testCreateStorage("does not throw if not configured to", ({ mockStorage }) => createRoot((dispose) => {
  const mockErrorStorage = {...mockStorage, setItem: () => { throw new Error('Throws'); } };
  const [_storage, setStorage, { error }] = createStorage({ api: mockErrorStorage });
  assert.not.throws(() => setStorage('test3', "1"), 'Throws', 'error thrown unexpectedly');
  assert.instance(error(), Error);
}));

testCreateStorage("does throw if configured to", ({ mockStorage }) => createRoot((dispose) => {
  const mockErrorStorage = {...mockStorage, setItem: () => { throw new Error('Throws'); } };
  const [_storage, setStorage, { error }] = createStorage({ api: mockErrorStorage, throw: true });
  assert.throws(() => setStorage('test3', "1"), 'Throws', 'error thrown unexpectedly');
  assert.instance(error(), Error);
}));

testCreateStorage.run();

const testCreateAsyncStorage = suite<{
  mockAsyncStorage: AsyncStorage;
}>("createAsyncStorage");

testCreateAsyncStorage.before(context => {
  let data: Record<string, string> = {};
  context.mockAsyncStorage = {
    getItem: (key: string) => Promise.resolve(data[key] ?? null),
    setItem: (key: string, value: string): Promise<void> => {
      const oldValue = data[key];
      data[key] = value;
      window.dispatchEvent(
        Object.assign(new Event("storage"), {
          key,
          newValue: value,
          oldValue,
          storageArea: context.mockAsyncStorage,
          url: window.document.URL
        })
      );
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

testCreateAsyncStorage("creates an async storage", ({ mockAsyncStorage }) => createRoot(async (dispose) => {
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
  dispose();
}));

testCreateAsyncStorage.run();

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
