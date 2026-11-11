import { describe, expect, it } from "vitest";
import {
  createEffect,
  createRoot,
  createSignal,
  createStore,
  createOptimistic,
  flush,
  latest,
  refresh,
  snapshot,
} from "solid-js";
import { makePersisted, messageSync, multiplexSync, storageSync, wsSync, type PersistenceSyncData } from "../src/persisted.js";
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
    flush();
    expect(mockStorage.getItem("test1")).toBe('"persisted"');
    expect(latest(signal)).toBe("persisted");
  });

  it("persists an optimistic signal", async () => {
    const DataServer = {
      data: "server",
      get: () => Promise.resolve(DataServer.data),
      set: (next: string) => new Promise((res) => setTimeout(() => res(DataServer.data = next), 50)),
    };
    const [signal, setSignal] = makePersisted(
      createRoot(() => createOptimistic(() => DataServer.get())),
      {
        storage: mockStorage,
        name: "test-optimistic",
        action: ([getter, setter]) => function*(next) {
          setter(next);
          yield DataServer.set(next);
          refresh(getter);
        }
      }
    );
    // let the initial server fetch settle before the optimistic write
    await new Promise(res => setTimeout(res, 0));
    flush();
    await setSignal("persisted");
    flush();
    expect(mockStorage.getItem("test-optimistic")).toBe('"persisted"');
    expect(latest(signal)).toBe("persisted")
  })

  it("reads the persisted value from a synchronous storage into the signal", () => {
    mockStorage.setItem("test2", '"persistence"');
    const [signal] = makePersisted(createSignal(), { storage: mockStorage, name: "test2" });
    flush();
    expect(latest(signal)).toBe("persistence");
  });

  it("removes a nulled signal's storage item", () => {
    const [signal, setSignal] = makePersisted(createSignal<string>(), {
      storage: mockStorage,
      name: "test3",
    });
    setSignal("test");
    flush();
    expect(mockStorage.getItem("test3")).toBe('"test"');
    expect(latest(signal)).toBe("test");
    setSignal(undefined);
    flush();
    expect(mockStorage.getItem("test3")).toBeNull();
  });

  it("persists a store", () => {
    const [store, setStore] = makePersisted(createStore({ test: "test" }), {
      storage: mockStorage,
      name: "test4",
    });
    setStore((s) => { s.test = "persisted" });
    flush();
    expect(store.test).toBe("persisted");
    expect(mockStorage.getItem("test4")).toBe(JSON.stringify({ test: "persisted" }));
  });
  
  it("only updates the leaves in initialization", async () => {
    mockAsyncStorage.setItem("test4a", JSON.stringify({ a: { b: { c: 1 } } }));
    const triggered = { a: 0, b: 0, c: 0 };
    await createRoot(async (dispose) => {
      const [state, setState] = createStore({ a: { b: { c: 0 } } });
      createEffect(() => state.a, (_) => { triggered.a++; });
      createEffect(() => state.a.b, (_) => { triggered.b++; });
      createEffect(() => state.a.b.c, (_) => { triggered.c++; });
      const [store, _setStore] = makePersisted(
        [state, setState],
        { storage: mockAsyncStorage, name: "test4a" }
      );
      await new Promise(r => setTimeout(r, 50));
      flush();
      expect(store).toEqual({ a: { b: { c: 1 } } });
      expect(triggered).toEqual({ a: 1, b: 1, c: 2 });
      queueMicrotask(dispose);;
    });
  });

  it("persists a signal in an async storage", async () => {
    const [signal, setSignal] = makePersisted(createSignal(), {
      storage: mockAsyncStorage,
      name: "test5",
    });
    setSignal("async");
    flush();
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
    flush();
    expect(latest(signal)).toBe("predefined");
    setSignal("overwritten");
    flush();
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
    flush();
    expect(latest(signal)).toBe("init");
    setSignal("overwritten");
    flush();
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
  
  it("keeps early writes and explicitly disposes sync and deferred init", async () => {
    mockStorage.setItem("cleanup", '"init"');
    const [value, setValue, , dispose] = createRoot(disposeRoot => {
      const persisted = makePersisted(createSignal("default"), {
        storage: mockStorage,
        name: "cleanup",
        hydrated: true,
        sync: multiplexSync(messageSync(window), storageSync),
      });
      disposeRoot();
      return persisted;
    });
    const send = (newValue: string) => window.dispatchEvent(new MessageEvent("message", {
      data: { key: "cleanup", newValue: JSON.stringify(newValue) },
    }));
    send("synced");
    flush();
    expect(value()).toBe("synced");
    window.dispatchEvent(new StorageEvent("storage", { key: "cleanup", newValue: '"stored"' }));
    flush();
    expect(value()).toBe("stored");
    setValue("user write");
    const [cancelled, , , cancel] = makePersisted(createSignal("default"), {
      storage: mockStorage,
      name: "cleanup",
      hydrated: true,
    });
    cancel();
    await new Promise(r => setTimeout(r, 100));
    flush();
    expect(value()).toBe("user write");
    expect(cancelled()).toBe("default");
    dispose();
    send("ignored");
    window.dispatchEvent(new StorageEvent("storage", { key: "cleanup", newValue: '"ignored"' }));
    flush();
    expect(value()).toBe("user write");
  });
  describe("merge option", () => {
    it("replaces the whole store shape by default (#748)", () => {
      mockStorage.setItem("merge1", JSON.stringify({ a: 2 }));
      const [store] = makePersisted(createStore<{ a: number; b?: number }>({ a: 1, b: 1 }), {
        storage: mockStorage,
        name: "merge1",
      });
      flush();
      expect(store).toEqual({ a: 2 });
    });

    it("keeps defaults for keys missing in the stored store data", () => {
      mockStorage.setItem("merge2", JSON.stringify({ a: 2 }));
      const [store, setStore] = makePersisted(createStore({ a: 1, b: 1 }), {
        storage: mockStorage,
        name: "merge2",
        merge: true,
      });
      flush();
      expect(store).toEqual({ a: 2, b: 1 });
      // merged defaults are not persisted until the next write
      expect(mockStorage.getItem("merge2")).toBe(JSON.stringify({ a: 2 }));
      setStore(s => { s.b = 3; });
      flush();
      expect(mockStorage.getItem("merge2")).toBe(JSON.stringify({ a: 2, b: 3 }));
    });

    it("deep-merges nested objects and replaces arrays", () => {
      mockStorage.setItem(
        "merge3",
        JSON.stringify({ nested: { x: 2, extra: true }, list: [3], removed: { y: 1 } }),
      );
      const [store] = makePersisted(
        createStore<Record<string, any>>({
          nested: { x: 1, y: 1, deeper: { z: 1 } },
          list: [1, 2],
          added: "default",
          removed: 5,
        }),
        { storage: mockStorage, name: "merge3", merge: true },
      );
      flush();
      expect(store).toEqual({
        nested: { x: 2, y: 1, deeper: { z: 1 }, extra: true },
        list: [3],
        added: "default",
        removed: { y: 1 },
      });
    });

    it("merges object values of signals and keeps primitives as stored", () => {
      mockStorage.setItem("merge4", JSON.stringify({ a: 2 }));
      const [signal] = makePersisted(createSignal({ a: 1, b: 1 }), {
        storage: mockStorage,
        name: "merge4",
        merge: true,
      });
      flush();
      expect(signal()).toEqual({ a: 2, b: 1 });
      mockStorage.setItem("merge5", '"stored"');
      const [primitive] = makePersisted(createSignal("default"), {
        storage: mockStorage,
        name: "merge5",
        merge: true,
      });
      flush();
      expect(primitive()).toBe("stored");
    });

    it("accepts a custom merge function", () => {
      mockStorage.setItem("merge6", JSON.stringify({ items: [{ id: 1 }] }));
      const [store] = makePersisted(createStore({ items: [] as { id: number; done?: boolean }[] }), {
        storage: mockStorage,
        name: "merge6",
        merge: (stored, initial) => ({
          ...initial,
          ...stored,
          items: stored.items.map(item => ({ done: false, ...item })),
        }),
      });
      flush();
      expect(store).toEqual({ items: [{ id: 1, done: false }] });
    });

    it("merges asynchronously loaded data onto the initial value", async () => {
      await mockAsyncStorage.setItem("merge7", JSON.stringify({ a: 2 }));
      const [store] = makePersisted(createStore({ a: 1, b: 1 }), {
        storage: mockAsyncStorage,
        name: "merge7",
        merge: true,
      });
      await Promise.resolve();
      flush();
      expect(store).toEqual({ a: 2, b: 1 });
    });

    it("merges onto the initial value with the hydrated option", async () => {
      const anotherMockStorage = { ...mockStorage };
      anotherMockStorage.setItem("merge8", JSON.stringify({ a: 2 }));
      const [store] = makePersisted(createStore({ a: 1, b: 1 }), {
        storage: anotherMockStorage,
        name: "merge8",
        hydrated: true,
        merge: true,
      });
      flush();
      expect(store).toEqual({ a: 1, b: 1 });
      await new Promise(r => setTimeout(r, 100));
      flush();
      expect(store).toEqual({ a: 2, b: 1 });
    });

    it("merges synced data onto the initial value, not onto the current state", () => {
      const [store, , , dispose] = makePersisted(createStore<Record<string, number>>({ a: 1, b: 1 }), {
        storage: mockStorage,
        name: "merge9",
        merge: true,
        sync: messageSync(window),
      });
      const send = (newValue: unknown) => window.dispatchEvent(new MessageEvent("message", {
        data: { key: "merge9", newValue: JSON.stringify(newValue) },
      }));
      send({ a: 2, c: 3 });
      flush();
      expect(store).toEqual({ a: 2, b: 1, c: 3 });
      send({ a: 4 });
      flush();
      expect(store).toEqual({ a: 4, b: 1 });
      dispose();
    });

    it("keeps the captured defaults isolated from later store writes", () => {
      mockStorage.setItem("merge10", JSON.stringify({ a: 2 }));
      const [store, setStore, , dispose] = makePersisted(
        createStore({ a: 1, nested: { x: 1 }, list: [1] }),
        { storage: mockStorage, name: "merge10", merge: true, sync: messageSync(window) },
      );
      flush();
      setStore(s => {
        s.nested.x = 99;
        s.list.push(2);
      });
      flush();
      expect(store).toEqual({ a: 2, nested: { x: 99 }, list: [1, 2] });
      window.dispatchEvent(new MessageEvent("message", {
        data: { key: "merge10", newValue: JSON.stringify({ a: 3 }) },
      }));
      flush();
      expect(store).toEqual({ a: 3, nested: { x: 1 }, list: [1] });
      dispose();
    });

    it("does not let a stored __proto__ key change prototypes", () => {
      mockStorage.setItem("merge11", '{"__proto__":{"polluted":true},"nested":{"__proto__":{"x":1}}}');
      const [store] = makePersisted(createStore<Record<string, any>>({ a: 1, nested: { y: 1 } }), {
        storage: mockStorage,
        name: "merge11",
        merge: true,
      });
      flush();
      expect(({} as any).polluted).toBeUndefined();
      expect(Object.getPrototypeOf(snapshot(store).nested)).toBe(Object.prototype);
      expect(store.a).toBe(1);
      expect(store.nested.y).toBe(1);
      expect(store.polluted).toBeUndefined();
    });

    it("lets a stored null replace an object default", () => {
      mockStorage.setItem("merge12", JSON.stringify({ a: null }));
      const [store] = makePersisted(createStore<{ a: { x: number } | null; b: number }>({ a: { x: 1 }, b: 1 }), {
        storage: mockStorage,
        name: "merge12",
        merge: true,
      });
      flush();
      expect(store).toEqual({ a: null, b: 1 });
    });

    it("persists signal writes normally with merge enabled", () => {
      mockStorage.setItem("merge13", JSON.stringify({ a: 2 }));
      const [signal, setSignal] = makePersisted(createSignal({ a: 1, b: 1 }), {
        storage: mockStorage,
        name: "merge13",
        merge: true,
      });
      flush();
      expect(signal()).toEqual({ a: 2, b: 1 });
      expect(mockStorage.getItem("merge13")).toBe(JSON.stringify({ a: 2 }));
      setSignal({ a: 3, b: 4 });
      flush();
      expect(mockStorage.getItem("merge13")).toBe(JSON.stringify({ a: 3, b: 4 }));
    });
  });

  it("defers the initialization if the hydrated option is set", async () => {
    const anotherMockStorage = { ...mockStorage };
    anotherMockStorage.setItem("test18", '"init"');
    const [signal, _setSignal] = makePersisted(
      createSignal("default"), 
      { storage: anotherMockStorage, name: "test18", hydrated: true }
    );
    flush();
    expect(signal()).toBe("default");
    await new Promise(r => setTimeout(r, 200));
    flush();
    expect(signal()).toBe("init"); 
  });
});

describe("storageSync", () => {
  it("receives messages", () => {
    const [message, subscriber] = createSignal<PersistenceSyncData>();
    storageSync[0](subscriber);
    const event = new StorageEvent(
      "storage",
      { key: "test9", newValue: "received", timeStamp: Date.now(), url: "https://storage.solid-primitives.org" }
    );
    window.dispatchEvent(event);
    flush();
    expect(message()).toEqual(event);
  });
});

describe("messageSync", () => {
  it("sends and receives messages", async () => {
    const [message, subscriber] = createSignal<PersistenceSyncData>();
    const sync = messageSync(window, "https://storage.solid-primitives.org");
    sync[0](subscriber);
    sync[1]("test10", "sent and received");
    await new Promise(r => setTimeout(r, 100));
    flush();
    expect(message()).toEqual({
      key: "test10",
      newValue: "sent and received",
      timeStamp: expect.any(Number),
      url: "https://storage.solid-primitives.org",
    });
  });
});

describe("wsSync", () => {
  it("sends and receives messages", async () => {
    const mockWs = {
      addEventListener: (name: string, handler: (ev: unknown) => void) => { 
        expect(name).toBe("message");
        mockWs.send = (data) => handler(new MessageEvent("message", { data }));
      },
    };
    const [message, subscriber] = createSignal<PersistenceSyncData>();
    const sync = wsSync(mockWs, true, "https://storage.solid-primitives.org");
    sync[0](subscriber);
    sync[1]("test11", "sent and received");
    await new Promise(r => setTimeout(r, 100));
    flush();
    expect(message()).toEqual({
      key: "test11",
      newValue: "sent and received",
      timeStamp: expect.any(Number),
      url: "https://storage.solid-primitives.org",
    });
  });
});
