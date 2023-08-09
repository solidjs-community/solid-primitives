import { describe, test, expect } from "vitest";
import {
  createAccelerometer,
  createCameras,
  createDevices,
  createGyroscope,
  createMicrophones,
  createSpeakers,
} from "../src/index.js";

describe("API doesn't break in SSR", () => {
  // check if the API doesn't throw when calling it in SSR
  test("createDevices() - SSR", () => {
    expect(createDevices()()).toEqual([]);
  });

  test("createMicrophones() - SSR", () => {
    expect(createMicrophones()()).toEqual([]);
  });

  test("createSpeakers() - SSR", () => {
    expect(createSpeakers()()).toEqual([]);
  });

  test("createCameras() - SSR", () => {
    expect(createCameras()()).toEqual([]);
  });

  test("createAccelerometer() - SSR", () => {
    expect(createAccelerometer()()).toEqual({ x: 0, y: 0, z: 0 });
  });

  test("createGyroscope() - SSR", () => {
    expect(createGyroscope()).toEqual({ alpha: 0, beta: 0, gamma: 0 });
  });
});
