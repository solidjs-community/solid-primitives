import { createGeolocation, createGeolocationWatcher } from "../src/index.js";
import { describe, expect, it } from "vitest";

describe("API doesn't break in SSR", () => {
  it("createGeolocation() - SSR", () => {
    const [location, refetch] = createGeolocation();
    expect(location()).toBe(undefined);
    expect(location.loading).toBe(true);
    expect(location.error).toBe(undefined);
    expect(refetch).toBeInstanceOf(Function);
  });

  it("createGeolocationWatcher() - SSR", () => {
    expect(createGeolocationWatcher(true)).toEqual({ location: null, error: null });
  });
});
