import { describe, test, expect } from "vitest";
import { createStream, createAmplitudeStream, createMediaPermissionRequest, createScreen } from "../src";

describe("API doesn't break in SSR", () => {
  // check if the API doesn't throw when calling it in SSR
  test("createStream() - SSR", () => {
    expect(createStream({ audio: true })[0]()).toBe(undefined);
  });

  test("createAmplitudeStream() - SSR", () => {
    expect(createAmplitudeStream({ audio: true })[0]()).toBe(0);
  });

  test("createMediaPermissionRequest() - SSR", () => {
    expect(createMediaPermissionRequest()).toBeInstanceOf(Promise);
  });

  test("createScreen() - SSR", () => {
    expect(createScreen({ audio: true })[0]()).toBe(undefined);
  });
});
