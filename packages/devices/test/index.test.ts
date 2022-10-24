import "./setup";
import { describe, it, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import {
  createDevices,
  createMicrophones,
  createSpeakers,
  createCameras,
  createAccelerometer,
  createGyroscope
} from "../src";

let fakeDeviceCount = 0;
const fakeDeviceInfo = (overrides: Partial<MediaDeviceInfo> = {}): MediaDeviceInfo => ({
  deviceId: Math.random().toString(36).slice(2),
  groupId: Math.random().toString(36).slice(2),
  kind: "audioinput",
  label: `fake device ${++fakeDeviceCount}`,
  toJSON: function () {
    return JSON.stringify(this);
  },
  ...overrides
});
const setDevices = (devices: MediaDeviceInfo[]) => {
  (window as any).__devices__ = devices;
};

describe("devices", () => {
  it("initially reads all devices", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" })
          ];
          setDevices(deviceFakes);
          const devices = createDevices();
          const expectedDevices = [[], deviceFakes];
          createEffect(() => {
            expect(devices()).toEqual(expectedDevices.shift());
            if (expectedDevices.length === 0) {
              dispose();
              resolve();
            }
          });
        })
    ));

  it("initially reads all microphones", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" })
          ];
          setDevices(deviceFakes);
          const microphones = createMicrophones();
          const expectedDevices = [[], [deviceFakes[0]]];
          createEffect(() => {
            expect(microphones()).toEqual(expectedDevices.shift());
            if (expectedDevices.length === 0) {
              dispose();
              resolve();
            }
          });
        })
    ));

  it("initially reads all speakers", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" })
          ];
          setDevices(deviceFakes);
          const speakers = createSpeakers();
          const expectedDevices = [[], [deviceFakes[1]]];
          createEffect(() => {
            expect(speakers()).toEqual(expectedDevices.shift());
            if (expectedDevices.length === 0) {
              dispose();
              resolve();
            }
          });
        })
    ));

  it("initially reads all cameras", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" })
          ];
          setDevices(deviceFakes);
          const cameras = createCameras();
          const expectedDevices = [[], [deviceFakes[2]]];
          createEffect(() => {
            expect(cameras()).toEqual(expectedDevices.shift());
            if (expectedDevices.length === 0) {
              dispose();
              resolve();
            }
          });
        })
    ));

  it("reads updated devices", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" })
          ];
          setDevices(deviceFakes.slice(0, 1));
          const devices = createDevices();
          const expectedDevices = [[], deviceFakes.slice(0, 1), deviceFakes];
          createEffect(() => {
            expect(devices()).toEqual(expectedDevices.shift());
            if (expectedDevices.length === 1) {
              setDevices(deviceFakes);
              (navigator.mediaDevices as any).dispatchFakeEvent();
              // navigator.mediaDevices.dispatchEvent(new Event("devicechange"));
            }
            if (expectedDevices.length === 0) {
              dispose();
              resolve();
            }
          });
        })
    ));

  it("reads the accelerometer", () => {
    const moveDevice = (acceleration?: { x: number; y: number; z: number }) =>
      dispatchEvent(new Event("deviceMotion", { acceleration } as any));
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const acceleration = createAccelerometer(false, 0);
          const expectedAcceleration = [
            undefined,
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0 },
            { x: 0, y: 1, z: 0 },
            { x: 0, y: 0, z: 1 }
          ];
          moveDevice(expectedAcceleration[1]);
          createEffect(() => {
            expect(acceleration()).toEqual(expectedAcceleration.shift());
            if (expectedAcceleration.length === 0) {
              dispose();
              resolve();
            } else {
              moveDevice(expectedAcceleration[0]);
            }
          });
        })
    );
  });

  it("reads the gyroscope", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const turnDevice = (orientation?: { alpha: number; beta: number; gamma: number }) =>
            dispatchEvent(Object.assign(new Event("deviceorientation", {}), orientation as any));
          const orientation = createGyroscope(0);
          const expectedOrientations = [
            { alpha: 0, beta: 0, gamma: 0 },
            { alpha: 1, beta: 0, gamma: 1 }
          ];
          createEffect(() => {
            expect({
              alpha: orientation.alpha,
              beta: orientation.beta,
              gamma: orientation.gamma
            }).toEqual(expectedOrientations.shift());
            if (expectedOrientations.length === 0) {
              dispose();
              resolve();
            } else {
              turnDevice(expectedOrientations[0]);
            }
          });
        })
    ));
});
