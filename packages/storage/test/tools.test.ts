import { addClearMethod } from "../src/tools";

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
    key: (index: number): string => Object.keys(data)[index],
    get length(): number {
      return Object.keys(data).length;
    }
  };
  const mockStorageWithClear = addClearMethod(mockStorage);
  test("adds clear method to storage without one", () => {
    expect(mockStorageWithClear.clear).toBeInstanceOf(Function);
  });

  test("clear method calls remove for all keys", () => {
    mockStorageWithClear.setItem("test1", "1");
    mockStorageWithClear.setItem("test2", "2");
    const removeSpy = jest.spyOn(mockStorageWithClear, "removeItem");
    mockStorageWithClear.clear();
    expect(removeSpy).toHaveBeenCalledTimes(2);
    expect(mockStorageWithClear.length).toBe(0);
    removeSpy.mockRestore();
  });

  test("returns storage that already has clear", () => {
    expect(mockStorageWithClear).toBe(addClearMethod(mockStorageWithClear));
  });
});
