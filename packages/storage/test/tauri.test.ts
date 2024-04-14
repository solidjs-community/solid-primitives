import { vi, describe, test, expect } from "vitest";
import { tauriStorage } from "../src/tauri.js";

vi.mock("@tauri-apps/plugin-store", () => {
  class Store {
    private data = new Map<string, any>();
    constructor(public name?: string) { }
    public get(key: string) {
      return Promise.resolve(this.data.get(key));
    }
    public has(key: string) {
      return Promise.resolve(this.data.has(key));
    }
    public set(key: string, value: any) {
      return Promise.resolve(this.data.set(key, value));
    }
    public delete(key: string) {
      return Promise.resolve(this.data.delete(key));
    }
    public keys() {
      return Promise.resolve(this.data.keys());
    }
    public length() {
      return Promise.resolve([...this.data.keys()].length);
    }
    public clear() {
      return Promise.resolve(this.data.clear());
    }
  }
  return { Store };
});

describe("tauriStorage", () => {
  const storage = tauriStorage();

  test("instantiates store on first operation", async () => {
    expect(storage._store).toBe(null);
    await storage.getItem("test");
    expect(storage._store).not.toBe(null);
  });

  test("sets and reads data", async () => {
    await storage.setItem("tauri", "is cool");
    expect(await storage.getItem("tauri")).toBe("is cool");
  });

  test("removes items", async () => {
    await storage.setItem("delete", "this");
    expect(await storage.getItem("delete")).toBe("this");
    await storage.removeItem("delete");
    expect(await storage.getItem("delete")).toBe(null);
  });
});

