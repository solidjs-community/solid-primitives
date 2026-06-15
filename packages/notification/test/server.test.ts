import { describe, test, expect } from "vitest";
import {
  isNotificationSupported,
  makeNotification,
  createNotification,
  createNotificationPermission,
} from "../src/index.js";

describe("isNotificationSupported (SSR)", () => {
  test("returns false on the server", () => {
    expect(isNotificationSupported()).toBe(false);
  });
});

describe("makeNotification (SSR)", () => {
  test("returns no-op functions without throwing", () => {
    const [show, close] = makeNotification("Hello", { body: "World" });
    expect(typeof show).toBe("function");
    expect(typeof close).toBe("function");
    expect(show()).toBeNull();
    expect(() => close()).not.toThrow();
  });
});

describe("createNotification (SSR)", () => {
  test("returns static defaults without throwing", () => {
    const { show, close, notification, supported } = createNotification("Hello");
    expect(supported).toBe(false);
    expect(notification()).toBeNull();
    expect(show()).toBeNull();
    expect(() => close()).not.toThrow();
  });
});

describe("createNotificationPermission (SSR)", () => {
  test("returns unknown permission, false pending, and resolves without throwing", async () => {
    const { permission, requestPermission, pending } = createNotificationPermission();
    expect(permission()).toBe("unknown");
    expect(pending()).toBe(false);
    await expect(requestPermission()).resolves.toBeUndefined();
  });
});
