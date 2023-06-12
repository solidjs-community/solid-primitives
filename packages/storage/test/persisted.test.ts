import { describe, expect, it } from "vitest";
import { createSignal } from "solid-js";
import { makePersisted } from "../src/persisted";

describe("makePersisted", () => {
  let data: Record<string, string> = {};
  const mockStorage: Storage = {
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
          url: window.document.URL,
        }),
      );
    },
    clear: () => {
      data = {};
    },
    removeItem: (key: string): void => {
      delete data[key];
    },
    key: (index: number): string => Object.keys(data)[index] || "",
    get length(): number {
      return Object.keys(data).length;
    },
  };

  it("persists a signal", () => {
    const [signal, setSignal] = makePersisted(createSignal(), { storage: mockStorage, name: "test1" });
    setSignal("persisted");
    expect(mockStorage.getItem("test1")).toBe('"persisted"');
    expect(signal()).toBe("persisted");
  });

  it.todo("removes a nulled signal's storage item");

  it.todo("persists a store");

  it.todo("persists in an async storage");

  it.todo("does not overwrite a written value from a slower async storage");
});

