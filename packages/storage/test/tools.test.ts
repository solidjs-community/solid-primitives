import { suite } from "uvu";
import * as assert from "uvu/assert";
import { addClearMethod } from "../src/tools";

const testAddCleaMethod = suite("addClearMethod");

const data: Record<string, string> = {};
const mockStorage: Omit<Storage, "clear"> = {
  getItem: (key: string): string | null => data[key] ?? null,
  setItem: (key: string, value: string): void => {
    data[key] = value;
  },
  removeItem: (key: string): void => {
    delete data[key];
  },
  key: (index: number): string => Object.keys(data)[index],
  get length(): number {
    return Object.keys(data).length;
  }
};
const mockStorageWithClear = addClearMethod(mockStorage);

testAddCleaMethod("adds clear method to storage without one", () => {
  assert.instance(mockStorageWithClear.clear, Function);
});

testAddCleaMethod("clear method calls remove for all keys", () => {
  mockStorageWithClear.setItem("test1", "1");
  mockStorageWithClear.setItem("test2", "2");
  const originalRemoveItem = mockStorageWithClear.removeItem;
  const removeItemCalls = [];
  mockStorageWithClear.removeItem = (...args) => {
    removeItemCalls.push(args);
    return originalRemoveItem(...args);
  };
  mockStorageWithClear.clear();
  assert.is(removeItemCalls.length, 2);
  assert.is(mockStorageWithClear.length, 0);
  mockStorageWithClear.removeItem = originalRemoveItem;
});

testAddCleaMethod("returns storage that already has clear", () => {
  assert.is(mockStorageWithClear, addClearMethod(mockStorageWithClear));
});

testAddCleaMethod.run();
