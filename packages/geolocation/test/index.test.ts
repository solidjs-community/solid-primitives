import "./setup";
import { mockCoordinates } from "./setup";
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { createGeolocation, createGeolocationWatcher } from "../src/index";

describe("createGeolocation", () => {
  it("test basic geolocation", () =>
    createRoot(async dispose => {
      const [location] = createGeolocation();
      expect(location.loading).toBe(true);
      await location.loading;
      expect(location.loading).toBe(false);
      expect(location()).toBe(mockCoordinates);
      dispose();
    })
  );

  it("test basic geolocation error", () =>
    createRoot(async dispose => {
      navigator.geolocation.getCurrentPosition = (_, reject: (error: any) => void) => {
        reject({ code: 1, message: "GeoLocation error" });
      };
      const [location] = createGeolocation();
      await location();
      expect(location.loading).toBe(false);
      expect(location.error).toBeInstanceOf(Error);
      expect(location.error.code).toBe(1);
      expect(location.error.message).toBe("GeoLocation error");
      dispose();
    })
  );
});

describe("createGeolocation", () => {
  it("test basic geolocation", () =>
    createRoot(async dispose => {
      const [enabled, setEnabled] = createSignal(false);
      const watcher = createGeolocationWatcher(enabled);
      expect(watcher.location).toBe(null);
      expect(watcher.error).toBe(null);
      await setEnabled(true);
      expect(watcher.location).toBe(mockCoordinates);
      dispose();
    })
  );
});
