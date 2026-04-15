import {
  makeGeolocation,
  makeGeolocationWatcher,
  createGeolocation,
  createGeolocationWatcher,
} from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("API doesn't break in SSR", () => {
  it("makeGeolocation() - SSR", async () => {
    const [query, cleanup] = makeGeolocation();
    expect(cleanup).toBeInstanceOf(Function);
    await expect(query()).rejects.toThrow();
  });

  it("makeGeolocationWatcher() - SSR", () => {
    const [store, cleanup] = makeGeolocationWatcher();
    expect(store.location).toBe(null);
    expect(store.error).toBe(null);
    expect(cleanup).toBeInstanceOf(Function);
  });

  it("createGeolocation() - SSR", () => {
    const [location, refetch] = createGeolocation();
    expect(() => location()).toThrow();
    expect(refetch).toBeInstanceOf(Function);
  });

  it("createGeolocationWatcher() - SSR", () => {
    const { location, error } = createGeolocationWatcher(true);
    expect(() => location()).toThrow();
    expect(error()).toBe(null);
  });
});
