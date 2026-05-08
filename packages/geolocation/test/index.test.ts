import "./setup";
import { mockCoordinates } from "./setup.js";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import {
  makeGeolocation,
  makeGeolocationWatcher,
  createGeolocation,
  createGeolocationWatcher,
  createDistance,
  createWithinRadius,
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
      .mockImplementation((_: any, reject: any) =>
        reject({ code: 1, message: "Permission denied" }),
      );
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
      const spy = vi
        .spyOn(navigator.geolocation, "watchPosition")
        .mockImplementation((_: any, errorCallback: any) => {
          errorCallback({ code: 1, message: "Denied" } as GeolocationPositionError);
          return 0;
        });
      const { error } = createGeolocationWatcher(true);
      await Promise.resolve();
      await Promise.resolve();
      expect(error()?.message).toBe("Denied");
      spy.mockRestore();
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

// ── createDistance ────────────────────────────────────────────────────────────

describe("createDistance", () => {
  it("returns null before first GPS fix", () =>
    createRoot(dispose => {
      const distance = createDistance(mockCoordinates, { enabled: false });
      expect(distance()).toBe(null);
      dispose();
    }));

  it("returns 0 when target matches user location", () =>
    createRoot(async dispose => {
      const distance = createDistance(mockCoordinates);
      await Promise.resolve();
      await Promise.resolve();
      expect(distance()).toBe(0);
      dispose();
    }));

  it("returns a positive km distance for a different target", () =>
    createRoot(async dispose => {
      // ~1 degree north of mockCoordinates ≈ 111 km away
      const distance = createDistance({ latitude: mockCoordinates.latitude + 1, longitude: mockCoordinates.longitude });
      await Promise.resolve();
      await Promise.resolve();
      expect(distance()).toBeGreaterThan(100);
      expect(distance()).toBeLessThan(120);
      dispose();
    }));

  it("converts to metres with unit: 'm'", () =>
    createRoot(async dispose => {
      const distanceKm = createDistance(mockCoordinates);
      const distanceM = createDistance(mockCoordinates, { unit: "m" });
      await Promise.resolve();
      await Promise.resolve();
      expect(distanceM()).toBe((distanceKm() ?? 0) * 1000);
      dispose();
    }));

  it("reacts when target changes", () =>
    createRoot(async dispose => {
      const [target, setTarget] = createSignal<{ latitude: number; longitude: number }>(mockCoordinates);
      const distance = createDistance(target);
      await Promise.resolve();
      await Promise.resolve();
      expect(distance()).toBe(0);
      setTarget({ latitude: mockCoordinates.latitude + 1, longitude: mockCoordinates.longitude });
      flush();
      expect(distance()).toBeGreaterThan(0);
      dispose();
    }));
});

// ── createWithinRadius ────────────────────────────────────────────────────────

describe("createWithinRadius", () => {
  it("returns false before first GPS fix", () =>
    createRoot(dispose => {
      const within = createWithinRadius(mockCoordinates, 1000, { enabled: false });
      expect(within()).toBe(false);
      dispose();
    }));

  it("returns true when user is at the centre (radius 0)", () =>
    createRoot(async dispose => {
      const within = createWithinRadius(mockCoordinates, 0);
      await Promise.resolve();
      await Promise.resolve();
      expect(within()).toBe(true);
      dispose();
    }));

  it("returns true when user is within radius", () =>
    createRoot(async dispose => {
      // User is at mockCoordinates; centre is same point; 1 km radius
      const within = createWithinRadius(mockCoordinates, 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(within()).toBe(true);
      dispose();
    }));

  it("returns false when user is outside radius", () =>
    createRoot(async dispose => {
      // Centre is ~111 km away; radius is only 1 km
      const farCenter = { latitude: mockCoordinates.latitude + 1, longitude: mockCoordinates.longitude };
      const within = createWithinRadius(farCenter, 1000);
      await Promise.resolve();
      await Promise.resolve();
      expect(within()).toBe(false);
      dispose();
    }));

  it("reacts when radius changes", () =>
    createRoot(async dispose => {
      // Centre is ~111 km away; start with small radius then expand
      const farCenter = { latitude: mockCoordinates.latitude + 1, longitude: mockCoordinates.longitude };
      const [radius, setRadius] = createSignal(1000);
      const within = createWithinRadius(farCenter, radius);
      await Promise.resolve();
      await Promise.resolve();
      expect(within()).toBe(false);
      setRadius(200_000); // 200 km
      flush();
      expect(within()).toBe(true);
      dispose();
    }));
});
