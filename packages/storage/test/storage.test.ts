import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";

import { createAsyncStorage, createStorage, createStorageSignal } from "../src/storage";

describe("createStorage", () => {
  let data: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string): string | null => data[key] ?? null,
    setItem: (key: string, value: string): void => {
      const oldValue = data[key];
      data[key] = value;
      window.dispatchEvent(
        Object.assign(new Event("storage"), {
          key,
          newValue: value,
          oldValue,
          storageArea: mockStorage,
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

  it("creates a storage", () =>
    createRoot(dispose => {
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
      dispose();
    }));

  it("does not throw if not configured to", () =>
    createRoot(dispose => {
      const mockErrorStorage = {
        ...mockStorage,
        setItem: () => {
          throw new Error("Throws");
        }
      };
      const [_storage, setStorage, { error }] = createStorage({ api: mockErrorStorage });
      expect(() => setStorage("test3", "1")).not.toThrow();
      expect(error()).toBeInstanceOf(Error);
    }));

  it("does throw if configured to", () =>
    createRoot(dispose => {
      const mockErrorStorage = {
        ...mockStorage,
        setItem: () => {
          throw new Error("Throws");
        }
      };
      const [_storage, setStorage, { error }] = createStorage({
        api: mockErrorStorage,
        throw: true
      });
      expect(() => setStorage("test3", "1")).toThrow();
      expect(error()).toBeInstanceOf(Error);
      dispose();
    }));
});

describe("createAsyncStorage", () => {
  let data: Record<string, string> = {};
  const mockAsyncStorage = {
    getItem: (key: string) => Promise.resolve(data[key] ?? null),
    setItem: (key: string, value: string): Promise<void> => {
      const oldValue = data[key];
      data[key] = value;
      window.dispatchEvent(
        Object.assign(new Event("storage"), {
          key,
          newValue: value,
          oldValue,
          storageArea: mockAsyncStorage,
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

  it("creates an async storage", () =>
    createRoot(async dispose => {
      const [storage, setStorage, { remove, clear }] = createAsyncStorage({
        api: mockAsyncStorage
      });
      await setStorage("test", "1" as any);
      await mockAsyncStorage.setItem("test2", "2");
      expect(await storage.test).toBe(await mockAsyncStorage.getItem("test"));
      expect(await storage.test).toBe("1");
      expect(await storage.test2).toBe("2");
      await remove("test2");
      expect(await storage.test2).toBe(null);
      await clear();
      expect(mockAsyncStorage.length).toBe(0);
      dispose();
    }));
});

describe("createStorageSignal", () => {
  let data: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string): string | null => data[key] ?? null,
    setItem: (key: string, value: string): void => {
      data[key] = value;
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    clear: () => {
      data = {};
    },
    key: (index: number): string => Object.keys(data)[index],
    get length(): number {
      return Object.keys(data).length;
    }
  };

  it("creates a signal", () =>
    createRoot(dispose => {
      const [storageItem, setStorageItem] = createStorageSignal<string | null>("test", null, {
        api: mockStorage
      });
      expect(storageItem()).toBe(null);
      setStorageItem("1");
      expect(storageItem()).toBe("1");
      dispose();
    }));
});
