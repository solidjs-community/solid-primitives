import {
  makeGeolocation,
  makeGeolocationWatcher,
  createGeolocation,
  createGeolocationWatcher,
  createDistance,
  createWithinRadius,
} from "../src/index.js";
import { NotReadyError } from "solid-js";
import { describe, expect, it } from "vitest";

const ipSeed = { latitude: 37.7749, longitude: -122.4194 };

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

describe("SSR with initialLocation (IP-seeded coordinates)", () => {
  it("createGeolocation() - SSR resolves with seed instead of throwing", async () => {
    const [location, refetch] = createGeolocation(undefined, ipSeed);
    const coords = await location();
    expect(coords.latitude).toBe(ipSeed.latitude);
    expect(coords.longitude).toBe(ipSeed.longitude);
    expect(refetch).toBeInstanceOf(Function);
  });

  it("createGeolocationWatcher() - SSR returns seed instead of throwing", () => {
    const { location, error } = createGeolocationWatcher(true, undefined, ipSeed);
    const coords = location();
    expect(coords.latitude).toBe(ipSeed.latitude);
    expect(coords.longitude).toBe(ipSeed.longitude);
    expect(error()).toBe(null);
  });

  it("createGeolocationWatcher() - SSR without seed still throws NotReadyError", () => {
    const { location } = createGeolocationWatcher(true);
    expect(() => location()).toThrow(NotReadyError);
  });

  it("createDistance() - SSR returns distance from seed", () => {
    const target = { latitude: ipSeed.latitude + 1, longitude: ipSeed.longitude };
    const distance = createDistance(target, { initialLocation: ipSeed });
    const d = distance();
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(100);
    expect(d!).toBeLessThan(120);
  });

  it("createDistance() - SSR without seed still returns null", () => {
    const distance = createDistance(ipSeed);
    expect(distance()).toBeNull();
  });

  it("createWithinRadius() - SSR returns true when seed is inside radius", () => {
    const within = createWithinRadius(ipSeed, 1000, { initialLocation: ipSeed });
    expect(within()).toBe(true);
  });

  it("createWithinRadius() - SSR returns false when seed is outside radius", () => {
    const farCenter = { latitude: ipSeed.latitude + 1, longitude: ipSeed.longitude };
    const within = createWithinRadius(farCenter, 1000, { initialLocation: ipSeed });
    expect(within()).toBe(false);
  });

  it("createWithinRadius() - SSR without seed still returns false", () => {
    const within = createWithinRadius(ipSeed, 1000);
    expect(within()).toBe(false);
  });
});
