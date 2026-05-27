import { describe, test, expect } from "vitest";
import {
  createAccelerometer,
  createGyroscope,
  createSensor,
  createCompass,
  createBattery,
} from "../src/index.js";

describe("API doesn't break in SSR", () => {
  test("createAccelerometer() - SSR", () => {
    expect(createAccelerometer()()).toEqual({ x: 0, y: 0, z: 0 });
  });

  test("createGyroscope() - SSR", () => {
    expect(createGyroscope()).toEqual({ alpha: 0, beta: 0, gamma: 0 });
  });

  test("createSensor() - SSR returns undefined accessor", () => {
    class FakeSensor extends EventTarget {
      activated = false;
      hasReading = false;
      timestamp = undefined;
      start() {}
      stop() {}
    }
    expect(createSensor(FakeSensor)()).toBeUndefined();
  });

  test("createCompass() - SSR", () => {
    expect(createCompass()).toEqual({ x: 0, y: 0, z: 0 });
  });

  test("createBattery() - SSR returns default reading", () => {
    expect(createBattery()()).toEqual({
      charging: false,
      chargingTime: 0,
      dischargingTime: 0,
      level: 1,
    });
  });
});
