import { createAsyncStorage, createStorage, createStorageSignal } from "../src/storage";
import { AsyncStorage } from "../src/types";

describe("createStorage", () => {
  let data: Record<string, string> = {};
  const mockStorage = {
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

  test("creates a storage", () => {
    const [storage, setStorage, { remove, clear }] = createStorage({ api: mockStorage });
    setStorage("test", "1");
    mockStorage.setItem("test2", "2");
    expect(storage.test).toBe(mockStorage.getItem("test"));
    expect(storage.test).toBe("1");
    expect(storage.test2).toBe("2");
    remove("test2");
    expect(storage.test2).toBe(null);
    clear();
    expect(mockStorage.length).toBe(0);
  });
});

describe("createAsyncStorage", () => {
  let data: Record<string, string> = {};
  const mockAsyncStorage: AsyncStorage = {
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

  test("creates an async storage", async () => {
    const [storage, setStorage, { remove, clear }] = createAsyncStorage({ api: mockAsyncStorage });
    await setStorage("test", "1");
    await mockAsyncStorage.setItem("test2", "2");
    expect(await storage.test).toBe(await mockAsyncStorage.getItem("test"));
    expect(await storage.test).toBe("1");
    expect(await storage.test2).toBe("2");
    await remove("test2");
    expect(await storage.test2).toBe(null);
    await clear();
    expect(mockAsyncStorage.length).toBe(0);
  });
});

describe("createStorageSignal", () => {
  let data: Record<string, string> = {};
  const mockStorage = {
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

  test("creates a signal", () => {
    const [storageItem, setStorageItem] = createStorageSignal<string | null, undefined>(
      "test",
      null,
      { api: mockStorage }
    );
    expect(storageItem()).toBe(null);
    setStorageItem("1");
    expect(storageItem()).toBe("1");
  });
});
