import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createEffect, createRoot } from "solid-js";
import {
  makeAccelerometer,
  createAccelerometer,
  makeGyroscope,
  createGyroscope,
  makeSensor,
  createSensor,
  makeCompass,
  createCompass,
  makeBattery,
  createBattery,
} from "../src/index.js";

const dispatchMotion = (acceleration: { x: number; y: number; z: number }) =>
  dispatchEvent(Object.assign(new Event("devicemotion"), { acceleration }));

const dispatchOrientation = (orientation: { alpha: number; beta: number; gamma: number }) =>
  dispatchEvent(Object.assign(new Event("deviceorientation"), orientation));

describe("makeAccelerometer", () => {
  it("calls onChange with acceleration data", () =>
    new Promise<void>(resolve => {
      const cleanup = makeAccelerometer(
        acc => {
          expect(acc).toMatchObject({ x: 1, y: 2, z: 3 });
          cleanup();
          resolve();
        },
        { interval: 0 },
      );
      dispatchMotion({ x: 1, y: 2, z: 3 });
    }));

  it("calls onChange multiple times after throttle interval", () =>
    new Promise<void>((resolve, reject) => {
      const readings: Array<{ x: number; y: number; z: number }> = [];
      const cleanup = makeAccelerometer(
        acc => {
          if (acc) readings.push({ x: acc.x ?? 0, y: acc.y ?? 0, z: acc.z ?? 0 });
          if (readings.length === 2) {
            expect(readings[0]).toEqual({ x: 1, y: 0, z: 0 });
            expect(readings[1]).toEqual({ x: 0, y: 2, z: 0 });
            cleanup();
            resolve();
          }
        },
        { interval: 0 },
      );

      dispatchMotion({ x: 1, y: 0, z: 0 });
      setTimeout(() => dispatchMotion({ x: 0, y: 2, z: 0 }), 10);
      setTimeout(() => reject(new Error("timed out")), 500);
    }));

  it("returns a working cleanup function", () => {
    const onChange = vi.fn();
    const cleanup = makeAccelerometer(onChange, { interval: 0 });
    dispatchMotion({ x: 1, y: 0, z: 0 });
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
    dispatchMotion({ x: 2, y: 0, z: 0 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("throttles rapid events", () => {
    let count = 0;
    const cleanup = makeAccelerometer(() => { count++; }, { interval: 100 });
    dispatchMotion({ x: 1, y: 0, z: 0 });
    dispatchMotion({ x: 2, y: 0, z: 0 });
    dispatchMotion({ x: 3, y: 0, z: 0 });
    expect(count).toBe(1);
    cleanup();
  });
});

describe("createAccelerometer", () => {
  it("starts as undefined and updates on motion events", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const acceleration = createAccelerometer(false, 0);
          expect(acceleration()).toBeUndefined();

          createEffect(
            () => acceleration(),
            val => {
              if (val !== undefined) {
                expect(val).toMatchObject({ x: 1, y: 2, z: 3 });
                dispose();
                resolve();
              }
            },
          );

          dispatchMotion({ x: 1, y: 2, z: 3 });
        }),
    ));

  it("updates reactively on subsequent events", () =>
    createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          const acceleration = createAccelerometer(false, 0);
          let count = 0;

          createEffect(
            () => acceleration(),
            val => {
              if (val === undefined) return;
              count++;
              if (count === 1) {
                expect(val).toMatchObject({ x: 1, y: 0, z: 0 });
                setTimeout(() => dispatchMotion({ x: 0, y: 1, z: 0 }), 10);
              } else if (count === 2) {
                expect(val).toMatchObject({ x: 0, y: 1, z: 0 });
                dispose();
                resolve();
              }
            },
          );

          dispatchMotion({ x: 1, y: 0, z: 0 });
          setTimeout(() => reject(new Error("timed out")), 500);
        }),
    ));
});

describe("makeGyroscope", () => {
  it("calls onChange with orientation data", () =>
    new Promise<void>(resolve => {
      const cleanup = makeGyroscope(
        o => {
          expect(o).toEqual({ alpha: 10, beta: 20, gamma: 30 });
          cleanup();
          resolve();
        },
        { interval: 0 },
      );
      dispatchOrientation({ alpha: 10, beta: 20, gamma: 30 });
    }));

  it("calls onChange multiple times after throttle interval", () =>
    new Promise<void>((resolve, reject) => {
      const readings: Array<{ alpha: number; beta: number; gamma: number }> = [];
      const cleanup = makeGyroscope(
        o => {
          readings.push(o);
          if (readings.length === 2) {
            expect(readings[0]).toEqual({ alpha: 10, beta: 20, gamma: 30 });
            expect(readings[1]).toEqual({ alpha: 0, beta: 0, gamma: 0 });
            cleanup();
            resolve();
          }
        },
        { interval: 0 },
      );

      dispatchOrientation({ alpha: 10, beta: 20, gamma: 30 });
      setTimeout(() => dispatchOrientation({ alpha: 0, beta: 0, gamma: 0 }), 10);
      setTimeout(() => reject(new Error("timed out")), 500);
    }));

  it("returns a working cleanup function", () => {
    const onChange = vi.fn();
    const cleanup = makeGyroscope(onChange, { interval: 0 });
    dispatchOrientation({ alpha: 1, beta: 0, gamma: 0 });
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
    dispatchOrientation({ alpha: 2, beta: 0, gamma: 0 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("defaults null orientation values to 0", () =>
    new Promise<void>(resolve => {
      const cleanup = makeGyroscope(
        o => {
          expect(o).toEqual({ alpha: 0, beta: 0, gamma: 0 });
          cleanup();
          resolve();
        },
        { interval: 0 },
      );
      dispatchEvent(new Event("deviceorientation"));
    }));
});

describe("createGyroscope", () => {
  it("starts with all-zero orientation", () => {
    createRoot(dispose => {
      const orientation = createGyroscope(0);
      expect(orientation.alpha).toBe(0);
      expect(orientation.beta).toBe(0);
      expect(orientation.gamma).toBe(0);
      dispose();
    });
  });

  it("updates reactively on orientation events", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const orientation = createGyroscope(0);

          createEffect(
            () => ({ alpha: orientation.alpha, beta: orientation.beta, gamma: orientation.gamma }),
            val => {
              if (val.alpha !== 0 || val.beta !== 0 || val.gamma !== 0) {
                expect(val).toEqual({ alpha: 10, beta: 20, gamma: 30 });
                dispose();
                resolve();
              }
            },
          );

          dispatchOrientation({ alpha: 10, beta: 20, gamma: 30 });
        }),
    ));

  it("updates multiple times reactively", () =>
    createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          const orientation = createGyroscope(0);
          let count = 0;

          createEffect(
            () => orientation.alpha,
            alpha => {
              count++;
              if (count === 1 && alpha === 5) {
                setTimeout(() => dispatchOrientation({ alpha: 10, beta: 0, gamma: 0 }), 10);
              } else if (count === 2 && alpha === 10) {
                expect(alpha).toBe(10);
                dispose();
                resolve();
              }
            },
          );

          dispatchOrientation({ alpha: 5, beta: 0, gamma: 0 });
          setTimeout(() => reject(new Error("timed out")), 500);
        }),
    ));
});

let lastSensorInstance: MockGenericSensor;

class MockGenericSensor extends EventTarget {
  activated = false;
  hasReading = false;
  timestamp: DOMHighResTimeStamp | undefined = undefined;
  value = 0;

  constructor(_opts?: any) {
    super();
    lastSensorInstance = this;
  }

  start() {
    this.activated = true;
  }
  stop() {
    this.activated = false;
  }

  fireReading(value: number) {
    this.value = value;
    this.hasReading = true;
    this.dispatchEvent(new Event("reading"));
  }
}

describe("makeSensor", () => {
  it("calls onChange on each reading", () => {
    const readings: number[] = [];
    const cleanup = makeSensor(MockGenericSensor, s => readings.push((s as MockGenericSensor).value));
    lastSensorInstance.fireReading(42);
    expect(readings).toEqual([42]);
    cleanup!();
  });

  it("starts the sensor on creation", () => {
    const cleanup = makeSensor(MockGenericSensor, () => {});
    expect(lastSensorInstance.activated).toBe(true);
    cleanup!();
  });

  it("returns null when constructor throws", () => {
    class ThrowingSensor {
      constructor() {
        throw new Error("Permission denied");
      }
    }
    expect(makeSensor(ThrowingSensor as any, () => {})).toBeNull();
  });

  it("cleanup stops the sensor and removes the reading listener", () => {
    const onChange = vi.fn();
    const cleanup = makeSensor(MockGenericSensor, onChange)!;
    lastSensorInstance.fireReading(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
    expect(lastSensorInstance.activated).toBe(false);
    lastSensorInstance.fireReading(2);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("fires onChange for every reading", () => {
    const onChange = vi.fn();
    const cleanup = makeSensor(MockGenericSensor, onChange)!;
    lastSensorInstance.fireReading(1);
    lastSensorInstance.fireReading(2);
    lastSensorInstance.fireReading(3);
    expect(onChange).toHaveBeenCalledTimes(3);
    cleanup();
  });
});

describe("createSensor", () => {
  it("starts as undefined", () => {
    createRoot(dispose => {
      const sensor = createSensor(MockGenericSensor);
      expect(sensor()).toBeUndefined();
      dispose();
    });
  });

  it("updates on reading events", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const sensorAcc = createSensor(MockGenericSensor);

          createEffect(
            () => sensorAcc(),
            s => {
              if (s !== undefined) {
                expect((s as MockGenericSensor).value).toBe(99);
                dispose();
                resolve();
              }
            },
          );

          lastSensorInstance.fireReading(99);
        }),
    ));

  it("re-fires on every reading even with the same sensor reference", () =>
    createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          const sensorAcc = createSensor(MockGenericSensor);
          const values: number[] = [];

          createEffect(
            () => sensorAcc(),
            s => {
              if (s !== undefined) {
                values.push((s as MockGenericSensor).value);
                if (values.length === 2) {
                  expect(values).toEqual([10, 20]);
                  dispose();
                  resolve();
                } else {
                  setTimeout(() => lastSensorInstance.fireReading(20), 10);
                }
              }
            },
          );

          lastSensorInstance.fireReading(10);
          setTimeout(() => reject(new Error("timed out")), 500);
        }),
    ));
});

let lastCompassInstance: MockMagnetometerSensor;
let lastCompassConstructorArgs: any;

class MockMagnetometerSensor extends EventTarget {
  x: number | null = null;
  y: number | null = null;
  z: number | null = null;
  activated = false;
  hasReading = false;
  timestamp: DOMHighResTimeStamp | undefined = undefined;

  constructor(_opts?: any) {
    super();
    lastCompassInstance = this;
    lastCompassConstructorArgs = _opts;
  }

  start() {
    this.activated = true;
  }
  stop() {
    this.activated = false;
  }

  fireReading(x: number | null, y: number | null, z: number | null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.hasReading = true;
    this.dispatchEvent(new Event("reading"));
  }
}

describe("makeCompass", () => {
  beforeEach(() => {
    (globalThis as any).Magnetometer = MockMagnetometerSensor;
  });
  afterEach(() => {
    delete (globalThis as any).Magnetometer;
  });

  it("returns null when Magnetometer is not in globalThis", () => {
    delete (globalThis as any).Magnetometer;
    expect(makeCompass(() => {})).toBeNull();
  });

  it("calls onChange with x/y/z reading", () => {
    const readings: Array<{ x: number; y: number; z: number }> = [];
    const cleanup = makeCompass(r => readings.push(r))!;
    lastCompassInstance.fireReading(1.5, 2.5, 3.5);
    expect(readings).toEqual([{ x: 1.5, y: 2.5, z: 3.5 }]);
    cleanup();
  });

  it("coerces null sensor values to 0", () => {
    const readings: Array<{ x: number; y: number; z: number }> = [];
    const cleanup = makeCompass(r => readings.push(r))!;
    lastCompassInstance.fireReading(null, null, null);
    expect(readings).toEqual([{ x: 0, y: 0, z: 0 }]);
    cleanup();
  });

  it("cleanup stops listening", () => {
    const onChange = vi.fn();
    const cleanup = makeCompass(onChange)!;
    lastCompassInstance.fireReading(1, 2, 3);
    expect(onChange).toHaveBeenCalledTimes(1);
    cleanup();
    lastCompassInstance.fireReading(4, 5, 6);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("passes options to the sensor constructor", () => {
    const spy = vi.spyOn(MockMagnetometerSensor.prototype, "start");
    const cleanup = makeCompass(() => {}, { frequency: 60, referenceFrame: "screen" })!;
    expect(spy).toHaveBeenCalled();
    expect(lastCompassConstructorArgs).toEqual({ frequency: 60, referenceFrame: "screen" });
    cleanup();
    spy.mockRestore();
  });
});

describe("createCompass", () => {
  beforeEach(() => {
    (globalThis as any).Magnetometer = MockMagnetometerSensor;
  });
  afterEach(() => {
    delete (globalThis as any).Magnetometer;
  });

  it("starts with all-zero values", () => {
    createRoot(dispose => {
      const compass = createCompass();
      expect(compass.x).toBe(0);
      expect(compass.y).toBe(0);
      expect(compass.z).toBe(0);
      dispose();
    });
  });

  it("updates reactively on readings", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const compass = createCompass();

          createEffect(
            () => ({ x: compass.x, y: compass.y, z: compass.z }),
            val => {
              if (val.x !== 0 || val.y !== 0 || val.z !== 0) {
                expect(val).toEqual({ x: 10, y: 20, z: 30 });
                dispose();
                resolve();
              }
            },
          );

          lastCompassInstance.fireReading(10, 20, 30);
        }),
    ));

  it("coerces null sensor values to 0 reactively", () =>
    createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          const compass = createCompass();
          let count = 0;

          createEffect(
            () => compass.x,
            x => {
              count++;
              if (count === 1) {
                expect(x).toBe(5);
                setTimeout(() => lastCompassInstance.fireReading(null, null, null), 10);
              } else if (count === 2) {
                expect(x).toBe(0);
                dispose();
                resolve();
              }
            },
          );

          lastCompassInstance.fireReading(5, 0, 0);
          setTimeout(() => reject(new Error("timed out")), 500);
        }),
    ));
});

type MockBatteryManager = EventTarget & {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
};

const makeMockBattery = (
  overrides: Partial<Omit<MockBatteryManager, keyof EventTarget>> = {},
): MockBatteryManager =>
  Object.assign(new EventTarget(), {
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
    level: 0.8,
    ...overrides,
  }) as MockBatteryManager;

describe("makeBattery", () => {
  let mockBattery: MockBatteryManager;

  beforeEach(() => {
    mockBattery = makeMockBattery();
    (navigator as any).getBattery = vi.fn(() => Promise.resolve(mockBattery));
  });

  afterEach(() => {
    delete (navigator as any).getBattery;
  });

  it("calls onChange with the initial battery reading", async () => {
    const readings: any[] = [];
    const cleanup = makeBattery(r => readings.push(r));
    await Promise.resolve();
    expect(readings).toHaveLength(1);
    expect(readings[0]).toEqual({
      charging: true,
      chargingTime: 0,
      dischargingTime: Infinity,
      level: 0.8,
    });
    cleanup();
  });

  it("calls onChange when a battery event fires", async () => {
    const readings: any[] = [];
    const cleanup = makeBattery(r => readings.push(r));
    await Promise.resolve();
    const initialCount = readings.length;
    mockBattery.level = 0.5;
    mockBattery.dispatchEvent(new Event("levelchange"));
    expect(readings.length).toBe(initialCount + 1);
    expect(readings[readings.length - 1].level).toBe(0.5);
    cleanup();
  });

  it("cleanup removes all battery event listeners", async () => {
    const onChange = vi.fn();
    const cleanup = makeBattery(onChange);
    await Promise.resolve();
    const callCount = onChange.mock.calls.length;
    cleanup();
    mockBattery.dispatchEvent(new Event("levelchange"));
    mockBattery.dispatchEvent(new Event("chargingchange"));
    expect(onChange).toHaveBeenCalledTimes(callCount);
  });

  it("no-ops when getBattery is not available", () => {
    delete (navigator as any).getBattery;
    const onChange = vi.fn();
    const cleanup = makeBattery(onChange);
    expect(onChange).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });

  it("cleanup before battery promise resolves does not attach listeners", async () => {
    const onChange = vi.fn();
    const cleanup = makeBattery(onChange);
    cleanup();
    await Promise.resolve();
    expect(onChange).not.toHaveBeenCalled();
    mockBattery.dispatchEvent(new Event("levelchange"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("createBattery", () => {
  let mockBattery: MockBatteryManager;

  beforeEach(() => {
    mockBattery = makeMockBattery();
    (navigator as any).getBattery = vi.fn(() => Promise.resolve(mockBattery));
  });

  afterEach(() => {
    delete (navigator as any).getBattery;
  });

  it("starts as undefined", () => {
    createRoot(dispose => {
      const battery = createBattery();
      expect(battery()).toBeUndefined();
      dispose();
    });
  });

  it("updates after the battery API resolves", async () => {
    await createRoot(async dispose => {
      const battery = createBattery();
      await Promise.resolve(); // let getBattery().then() run and call setReading()
      await Promise.resolve(); // let Solid's auto-batch flush apply the signal write
      expect(battery()).toEqual({
        charging: true,
        chargingTime: 0,
        dischargingTime: Infinity,
        level: 0.8,
      });
      dispose();
    });
  });

  it("updates reactively on battery events", () =>
    createRoot(
      dispose =>
        new Promise<void>((resolve, reject) => {
          const battery = createBattery();
          let count = 0;

          createEffect(
            () => battery(),
            val => {
              if (val === undefined) return;
              count++;
              if (count === 1) {
                expect(val.level).toBe(0.8);
                mockBattery.level = 0.5;
                mockBattery.dispatchEvent(new Event("levelchange"));
              } else if (count === 2) {
                expect(val.level).toBe(0.5);
                dispose();
                resolve();
              }
            },
          );

          Promise.resolve().then(() => setTimeout(() => reject(new Error("timed out")), 500));
        }),
    ));
});
