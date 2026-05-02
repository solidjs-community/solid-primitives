import {
  makeGeolocation,
  makeGeolocationWatcher,
  createGeolocation,
  createGeolocationWatcher,
} from "../src/index.js";
import { NotReadyError } from "solid-js";
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

  it("createGeolocation() - SSR throws NotReadyError (integrates with <Loading>)", () => {
    const [location, refetch] = createGeolocation();
    expect(() => location()).toThrow(NotReadyError);
    expect(refetch).toBeInstanceOf(Function);
  });

  it("createGeolocationWatcher() - SSR throws NotReadyError (integrates with <Loading>)", () => {
    const { location, error } = createGeolocationWatcher(true);
    expect(() => location()).toThrow(NotReadyError);
    expect(error()).toBe(null);
  });
});
