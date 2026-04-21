import { describe, expect, it } from "vitest";
import { action, createSignal, createStore, createOptimistic, latest, refresh, type Signal } from "solid-js";
import { makePersisted } from "../src/persisted.js";
import { type AsyncStorage } from "../src/index.js";

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

  let asyncData: Record<string, string> = {};
  const mockAsyncStorage: AsyncStorage = {
    getItem: (key: string) => Promise.resolve(asyncData[key] ?? null),
    setItem: (key: string, value: string) => {
      asyncData[key] = value;
      return Promise.resolve();
    },
    clear: () => {
      asyncData = {};
    },
    removeItem: (key: string) => {
      delete asyncData[key];
      return Promise.resolve();
    },
    key: (index: number) => Promise.resolve(Object.keys(asyncData)[index] || ""),
    get length(): number {
      return Object.keys(asyncData).length;
    },
  };

  it("persists a signal", () => {
    const [signal, setSignal] = makePersisted(createSignal(), {
      storage: mockStorage,
      name: "test1",
    });
    setSignal("persisted");
    expect(mockStorage.getItem("test1")).toBe('"persisted"');
    expect(latest(signal)).toBe("persisted");
  });
  
  // currently, optimistic is broken
  it.skip("persists an optimistic signal", async () => {
    const DataServer = {
      data: "server",
      get: () => Promise.resolve(DataServer.data),
      set: (next: string) => new Promise((res) => setTimeout(() => res(DataServer.data = next), 50)),
    };
    const [optimistic, updateOptimistic] = createOptimistic(() => DataServer.get(), "initial");
    const setOptimistic = action(function*(data) {
      updateOptimistic(data);
      yield DataServer.set(data);
    });
    const [signal, setSignal] = makePersisted(
      [optimistic, setOptimistic],
      { storage: mockStorage, name: "test1" }
    );
    await setSignal("persisted");
    expect(mockStorage.getItem("test1")).toBe('"persisted"');
    expect(latest(signal)).toBe("persisted")
  })

  it("reads the persisted value from a synchronous storage into the signal", () => {
    mockStorage.setItem("test2", '"persistence"');
    const [signal] = makePersisted(createSignal(), { storage: mockStorage, name: "test2" });
    expect(latest(signal)).toBe("persistence");
  });

  it("removes a nulled signal's storage item", () => {
    const [signal, setSignal] = makePersisted(createSignal<string>(), {
      storage: mockStorage,
      name: "test3",
    });
    setSignal("test");
    expect(mockStorage.getItem("test3")).toBe('"test"');
    expect(latest(signal)).toBe("test");
    setSignal(undefined);
    expect(mockStorage.getItem("test3")).toBeNull();
  });

  it("persists a store", () => {
    const [store, setStore] = makePersisted(createStore({ test: "test" }), {
      storage: mockStorage,
      name: "test4",
    });
    setStore((s) => { s.test = "persisted" });
    expect(store.test).toBe("persisted");
    expect(mockStorage.getItem("test4")).toBe(JSON.stringify({ test: "persisted" }));
  });

  it("persists a signal in an async storage", async () => {
    const [signal, setSignal] = makePersisted(createSignal(), {
      storage: mockAsyncStorage,
      name: "test5",
    });
    setSignal("async");
    expect(latest(signal)).toBe("async");
    expect(await mockAsyncStorage.getItem("test5")).toBe('"async"');
  });

  it("reads the persisted value from an asynchronous storage into the signal", async () => {
    await mockAsyncStorage.setItem("test6", '"predefined"');
    const [signal, setSignal] = makePersisted(createSignal(), {
      storage: mockAsyncStorage,
      name: "test6",
    });
    await Promise.resolve();
    expect(latest(signal)).toBe("predefined");
    setSignal("overwritten");
    await Promise.resolve();
    expect(await mockAsyncStorage.getItem("test6")).toBe('"overwritten"');
  });

  it("does not overwrite a written value from a slower async storage", () => {
    const slowMockAsyncStorage = { ...mockAsyncStorage };
    let resolve: (value: string | PromiseLike<string>) => void = () => undefined;
    slowMockAsyncStorage.getItem = (_key: string) =>
      new Promise<string>(r => {
        resolve = r;
      });
    const [signal, setSignal] = makePersisted(createSignal("init"), {
      storage: slowMockAsyncStorage,
      name: "test7",
    });
    expect(latest(signal)).toBe("init");
    setSignal("overwritten");
    resolve("persisted");
    expect(latest(signal)).toBe("overwritten");
  });

  it("exposes the initial value as third part of the return tuple", () => {
    const anotherMockAsyncStorage = { ...mockAsyncStorage };
    const promise = Promise.resolve('"init"');
    anotherMockAsyncStorage.getItem = () => promise;
    const [_signal, _setSignal, init] = makePersisted(createSignal("default"), {
      storage: anotherMockAsyncStorage,
      name: "test8",
    });
    expect(init).toBe(promise);
  });
});
