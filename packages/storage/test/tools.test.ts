import { describe, expect, it } from "vitest";
import { addClearMethod, makeObjectStorage } from "../src/index.js";

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
