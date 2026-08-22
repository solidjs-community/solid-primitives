import { describe, it, expect } from "vitest";
import { createVibration } from "../src/vibration";
import { createWakeLock } from "../src/wakelock";
import { createScreenOrientation } from "../src/orientation";

describe("createVibration", () => {
  it("returns safe fallback in non-supported environments", () => {
    const { isSupported, vibrate, stop } = createVibration();
    expect(typeof isSupported).toBe("boolean");
    expect(typeof vibrate).toBe("function");
    expect(typeof stop).toBe("function");
  });
});

describe("createWakeLock", () => {
  it("returns safe fallback in non-supported environments", () => {
    const { isSupported, isActive, request, release } = createWakeLock();
    expect(typeof isSupported).toBe("boolean");
    expect(typeof isActive).toBe("function");
    expect(typeof request).toBe("function");
    expect(typeof release).toBe("function");
  });
});

describe("createScreenOrientation", () => {
  it("returns safe fallback in non-supported environments", () => {
    const { isSupported, orientation, lock, unlock } = createScreenOrientation();
    expect(typeof isSupported).toBe("boolean");
    expect(typeof orientation).toBe("function");
    expect(typeof lock).toBe("function");
    expect(typeof unlock).toBe("function");
  });
});
