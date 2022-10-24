import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";

import { cookieStorage } from "../src";
import { createCookieStorage, createCookieStorageSignal } from "../src/cookies";

describe("cookieStorage", () => {
  it("adds/gets/removes an item", () => {
    expect(cookieStorage.getItem("test")).toBe(null);
    cookieStorage.setItem("test", "1");
    expect(cookieStorage.getItem("test")).toBe("1");
    cookieStorage.removeItem("test");
    expect(cookieStorage.getItem("test")).toBe(null);
  });
});

describe("createCookieStorage", () => {
  it("creates a storage", () =>
    createRoot(dispose => {
      cookieStorage.clear();
      const [storage, setStorage, { remove, clear }] = createCookieStorage();
      setStorage("test", "1");
      cookieStorage.setItem("test2", "2");
      expect(storage.test).toBe(cookieStorage.getItem("test"));
      expect(storage.test).toBe("1");
      expect(storage.test2).toBe("2");
      remove("test2");
      expect(storage.test2).toBe(null);
      clear();
      expect(cookieStorage.length).toBe(0);
      dispose();
    }));
});

describe("createCookieSignal", () => {
  it("creates a signal", () =>
    createRoot(dispose => {
      const [getter, setter] = createCookieStorageSignal("test3");
      expect(getter()).toBe(undefined);
      setter("3");
      expect(getter()).toBe("3");
      dispose();
    }));
});
