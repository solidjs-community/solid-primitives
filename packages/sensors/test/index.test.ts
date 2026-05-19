import { describe, it, expect, vi } from "vitest";
import { createEffect, createRoot } from "solid-js";
import {
  makeAccelerometer,
  createAccelerometer,
  makeGyroscope,
  createGyroscope,
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
      // Wait for the zero-ms throttle to clear, then fire the second event
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
