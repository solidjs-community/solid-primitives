import { describe, expect, it } from "vitest";
import type { AsyncStorage } from "../src/index.js";
import { addClearMethod, makeObjectStorage, multiplexStorage } from "../src/index.js";

describe("addClearMethod", () => {
  const data: Record<string, string> = {};
  const mockStorage: Omit<Storage, "clear"> = {
    getItem: (key: string): string | null => data[key] ?? null,
    setItem: (key: string, value: string): void => {
      data[key] = value;
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    key: (index: number): string => Object.keys(data)[index] || "",
    get length(): number {
      return Object.keys(data).length;
    },
  };
  const mockStorageWithClear = addClearMethod(mockStorage);

  it("adds clear method to storage without one", () => {
    expect(mockStorageWithClear.clear).toBeInstanceOf(Function);
  });

  it("clear method calls remove for all keys", () => {
    mockStorageWithClear.setItem("test1", "1");
    mockStorageWithClear.setItem("test2", "2");
    const originalRemoveItem = mockStorageWithClear.removeItem;
    const removeItemCalls = [];
    mockStorageWithClear.removeItem = (...args) => {
      removeItemCalls.push(args);
      return originalRemoveItem(...args);
    };
    mockStorageWithClear.clear();
    expect(removeItemCalls.length).toBe(2);
    expect(mockStorageWithClear.length).toBe(0);
    mockStorageWithClear.removeItem = originalRemoveItem;
  });

  it("returns storage that already has clear", () => {
    expect(mockStorageWithClear).toBe(addClearMethod(mockStorageWithClear));
  });
});

describe("makeObjectStorage", () => {
  it("provides a wrapper for an object", () => {
    const obj: Record<string, string> = {};
    const storage = makeObjectStorage(obj);
    expect(obj.test).toBeUndefined();
    storage.setItem("test", "works");
    expect(obj.test).toBe("works");
    expect(storage.getItem("test")).toBe("works");
    storage.removeItem("test");
    expect(obj).not.toHaveProperty("test");
    expect(storage.getItem("test")).toBeNull();
  });
});

describe("multiplexStorage", () => {
  const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
  const asyncStorage = (
    data: Record<string, string>,
    ms = 0,
    fail?: Error,
  ): AsyncStorage & { length: number } => {
    const sync = makeObjectStorage(data);
    const later = async <T>(fn: () => T): Promise<T> => {
      await delay(ms);
      if (fail) throw fail;
      return fn();
    };
    return {
      getItem: (key: string) => later(() => sync.getItem(key)),
      setItem: (key: string, value: string) => later(() => sync.setItem(key, value)),
      removeItem: (key: string) => later(() => sync.removeItem(key)),
      clear: () => later(() => sync.clear()),
      key: (index: number) => later(() => sync.key(index)),
      get length() {
        return sync.length;
      },
    };
  };

  it("sync: returns the first storage with a value", () => {
    const storage = multiplexStorage(makeObjectStorage({}), makeObjectStorage({ test: "second" }));
    expect(storage.getItem("test")).toBe("second");
  });

  it("mixed sync/async: falls back to a later async storage if the sync one has no value", async () => {
    const storage = multiplexStorage(makeObjectStorage({}), asyncStorage({ test: "async" }, 10));
    await expect(storage.getItem("test")).resolves.toBe("async");
  });

  it("mixed sync/async: prefers an earlier sync value over a later async one", async () => {
    const storage = multiplexStorage(
      makeObjectStorage({ test: "sync" }),
      asyncStorage({ test: "async" }, 10),
    );
    await expect(storage.getItem("test")).resolves.toBe("sync");
  });

  it("all async: a fast storage without value does not hide a slower one with a value", async () => {
    const storage = multiplexStorage(asyncStorage({}, 0), asyncStorage({ test: "slow" }, 20));
    await expect(storage.getItem("test")).resolves.toBe("slow");
  });

  it("all async: storage order wins over response time", async () => {
    const storage = multiplexStorage(
      asyncStorage({ test: "first" }, 20),
      asyncStorage({ test: "second" }, 0),
    );
    await expect(storage.getItem("test")).resolves.toBe("first");
  });

  it("all async: resolves null if no storage has a value", async () => {
    const storage = multiplexStorage(asyncStorage({}, 10), asyncStorage({}, 0));
    await expect(storage.getItem("test")).resolves.toBeNull();
  });

  it("a rejecting storage does not hide a later storage's value", async () => {
    const storage = multiplexStorage(
      asyncStorage({ test: "broken" }, 0, new Error("unavailable")),
      asyncStorage({ test: "fallback" }, 10),
    );
    await expect(storage.getItem("test")).resolves.toBe("fallback");
  });

  it("a rejecting later storage does not affect an earlier value", async () => {
    const storage = multiplexStorage(
      asyncStorage({ test: "first" }, 20),
      asyncStorage({}, 0, new Error("unavailable")),
    );
    await expect(storage.getItem("test")).resolves.toBe("first");
  });

  it("rejects with the first error if no storage has a value and one rejected", async () => {
    const storage = multiplexStorage(
      asyncStorage({}, 0),
      asyncStorage({}, 10, new Error("first error")),
      asyncStorage({}, 0, new Error("second error")),
    );
    await expect(storage.getItem("test")).rejects.toThrow("first error");
  });

  it("does not wait for later storages once an earlier one has a value", async () => {
    const hanging: AsyncStorage = {
      ...asyncStorage({}),
      getItem: () => new Promise<string | null>(() => {}),
    };
    const storage = multiplexStorage(asyncStorage({ test: "first" }, 5), hanging);
    await expect(storage.getItem("test")).resolves.toBe("first");
  });

  it("mixed sync/async: a sync value wins over a rejecting async storage", async () => {
    const storage = multiplexStorage(
      makeObjectStorage({ test: "sync" }),
      asyncStorage({}, 0, new Error("unavailable")),
    );
    await expect(storage.getItem("test")).resolves.toBe("sync");
  });

  it("key: returns the first storage's key in order", async () => {
    const storage = multiplexStorage(asyncStorage({}, 0), asyncStorage({ test: "1" }, 10));
    await expect(storage.key(0)).resolves.toBe("test");
  });
});
