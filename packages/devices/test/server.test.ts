import { describe, test, expect } from "vitest";
import { createCameras, createDevices, createMicrophones, createSpeakers } from "../src/index.js";

describe("API doesn't break in SSR", () => {
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
});
