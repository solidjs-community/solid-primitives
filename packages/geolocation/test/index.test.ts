import "./setup";
import { mockCoordinates } from "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  makeGeolocation,
  makeGeolocationWatcher,
  createGeolocation,
  createGeolocationWatcher,
} from "../src/index.js";

// ── makeGeolocation ───────────────────────────────────────────────────────────

describe("makeGeolocation", () => {
  it("resolves coordinates without a Solid owner", async () => {
    const [query, cleanup] = makeGeolocation();
    const coords = await query();
    expect(coords).toBe(mockCoordinates);
    cleanup();
  });

  it("cleanup prevents resolution of subsequent queries", async () => {
    const [query, cleanup] = makeGeolocation();
    cleanup();
    // query after cleanup should not resolve (it returns without calling getCurrentPosition)
    let resolved = false;
    query().then(() => (resolved = true));
    await Promise.resolve();
    expect(resolved).toBe(false);
  });

  it("rejects when geolocation fails", async () => {
    const spy = vi
      .spyOn(navigator.geolocation, "getCurrentPosition")
      .mockImplementation((_: any, reject: any) => reject({ code: 1, message: "Permission denied" }));
    const [query, cleanup] = makeGeolocation();
    await expect(query()).rejects.toThrow("Permission denied");
    cleanup();
    spy.mockRestore();
  });
});

// ── makeGeolocationWatcher ────────────────────────────────────────────────────

describe("makeGeolocationWatcher", () => {
  it("starts watching and provides initial location without a Solid owner", () => {
    const [store, cleanup] = makeGeolocationWatcher();
    expect(store.location).toBe(mockCoordinates);
    expect(store.error).toBe(null);
    cleanup();
  });

  it("cleanup calls clearWatch", () => {
    const clearWatch = vi.spyOn(navigator.geolocation, "clearWatch");
    const [, cleanup] = makeGeolocationWatcher();
    cleanup();
    expect(clearWatch).toHaveBeenCalled();
    clearWatch.mockRestore();
  });
});

// ── createGeolocation ─────────────────────────────────────────────────────────

describe("createGeolocation", () => {
  it("resolves coordinates via async accessor", () =>
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

  it("re-queries when reactive options change", () =>
    createRoot(async dispose => {
      let lastOptions: PositionOptions | undefined;
      navigator.geolocation.getCurrentPosition = (
        resolve: PositionCallback,
        _: any,
        opts?: PositionOptions,
      ) => {
        lastOptions = opts;
        resolve({ coords: mockCoordinates } as GeolocationPosition);
      };
      const [opts, setOpts] = createSignal<PositionOptions>({ enableHighAccuracy: false });
      const [location] = createGeolocation(opts);
      await location();
      expect(lastOptions?.enableHighAccuracy).toBe(false);
      setOpts({ enableHighAccuracy: true });
      flush();
      await location();
      expect(lastOptions?.enableHighAccuracy).toBe(true);
      dispose();
    }));
});

// ── createGeolocationWatcher ──────────────────────────────────────────────────

describe("createGeolocationWatcher", () => {
  it("location and error are signal accessors", () =>
    createRoot(dispose => {
      const { location, error } = createGeolocationWatcher(true);
      expect(typeof location).toBe("function");
      expect(typeof error).toBe("function");
      dispose();
    }));

  it("location updates after first watchPosition callback", () =>
    createRoot(async dispose => {
      const { location } = createGeolocationWatcher(true);
      // Allow effect + watchPosition callback to run
      await Promise.resolve();
      await Promise.resolve();
      expect(location()).toBe(mockCoordinates);
      dispose();
    }));

  it("location throws NotReadyError (pending) before first fix", () =>
    createRoot(dispose => {
      const { location } = createGeolocationWatcher(false);
      expect(() => location()).toThrow();
      dispose();
    }));

  it("error() is null on success", () =>
    createRoot(async dispose => {
      const { error } = createGeolocationWatcher(true);
      await Promise.resolve();
      expect(error()).toBe(null);
      dispose();
    }));

  it("error() is set when watchPosition fails", () =>
    createRoot(async dispose => {
      navigator.geolocation.watchPosition = (
        _: PositionCallback,
        errorCallback: PositionErrorCallback,
      ) => {
        errorCallback({ code: 1, message: "Denied" } as GeolocationPositionError);
        return 0;
      };
      const { error } = createGeolocationWatcher(true);
      await Promise.resolve();
      await Promise.resolve();
      expect(error()?.message).toBe("Denied");
      dispose();
    }));

  it("clears the watcher when disabled", () =>
    createRoot(async dispose => {
      const clearWatch = vi.spyOn(navigator.geolocation, "clearWatch");
      const [enabled, setEnabled] = createSignal(true);
      createGeolocationWatcher(enabled);
      await Promise.resolve();
      setEnabled(false);
      await Promise.resolve();
      expect(clearWatch).toHaveBeenCalled();
      clearWatch.mockRestore();
      dispose();
    }));
});
