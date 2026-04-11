import "./setup";
import { mockCoordinates } from "./setup.js";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { createGeolocation, createGeolocationWatcher } from "../src/index.js";

describe("createGeolocation", () => {
  it("resolves coordinates on success", () =>
    createRoot(async dispose => {
      const [location] = createGeolocation();
      const coords = await location();
      expect(coords).toBe(mockCoordinates);
      dispose();
    }));

  it("rejects with an Error on failure", () =>
    createRoot(async dispose => {
      navigator.geolocation.getCurrentPosition = (_, reject: (error: any) => void) => {
        reject({ code: 1, message: "GeoLocation error" });
      };
      const [location] = createGeolocation();
      await expect(location()).rejects.toThrow("GeoLocation error");
      dispose();
    }));

  it("refetch triggers a new position query", () =>
    createRoot(async dispose => {
      let callCount = 0;
      navigator.geolocation.getCurrentPosition = (resolve: PositionCallback) => {
        callCount++;
        resolve({ coords: mockCoordinates } as GeolocationPosition);
      };
      const [location, refetch] = createGeolocation();
      await location();
      expect(callCount).toBe(1);
      refetch();
      await location();
      expect(callCount).toBe(2);
      dispose();
    }));
});

describe("createGeolocationWatcher", () => {
  it("location is null when disabled", () =>
    createRoot(dispose => {
      const watcher = createGeolocationWatcher(false);
      expect(watcher.location).toBe(null);
      expect(watcher.error).toBe(null);
      dispose();
    }));

  it("location updates when enabled", () =>
    createRoot(async dispose => {
      const [enabled, setEnabled] = createSignal(false);
      const watcher = createGeolocationWatcher(enabled);
      expect(watcher.location).toBe(null);
      setEnabled(true);
      // Allow effect to flush
      await Promise.resolve();
      expect(watcher.location).toBe(mockCoordinates);
      dispose();
    }));

  it("clears the watcher when disabled after being enabled", () =>
    createRoot(async dispose => {
      let cleared = false;
      const origClear = navigator.geolocation.clearWatch;
      navigator.geolocation.clearWatch = () => {
        cleared = true;
      };
      const [enabled, setEnabled] = createSignal(true);
      createGeolocationWatcher(enabled);
      await Promise.resolve();
      setEnabled(false);
      await Promise.resolve();
      expect(cleared).toBe(true);
      navigator.geolocation.clearWatch = origClear;
      dispose();
    }));
});
