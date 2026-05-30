import "./setup";
import { describe, it, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createDevices, createMicrophones, createSpeakers, createCameras } from "../src/index.js";

let fakeDeviceCount = 0;
const fakeDeviceInfo = (overrides: Partial<MediaDeviceInfo> = {}): MediaDeviceInfo => ({
  deviceId: Math.random().toString(36).slice(2),
  groupId: Math.random().toString(36).slice(2),
  kind: "audioinput",
  label: `fake device ${++fakeDeviceCount}`,
  toJSON: function () {
    return JSON.stringify(this);
  },
  ...overrides,
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
            fakeDeviceInfo({ kind: "videoinput" }),
          ];
          setDevices(deviceFakes);
          const devices = createDevices();
          createEffect(
            () => devices(),
            val => {
              if (val.length > 0) {
                expect(val).toEqual(deviceFakes);
                dispose();
                resolve();
              }
            },
          );
        }),
    ));

  it("initially reads all microphones", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" }),
          ];
          setDevices(deviceFakes);
          const microphones = createMicrophones();
          createEffect(
            () => microphones(),
            val => {
              if (val.length > 0) {
                expect(val).toEqual([deviceFakes[0]]);
                dispose();
                resolve();
              }
            },
          );
        }),
    ));

  it("initially reads all speakers", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" }),
          ];
          setDevices(deviceFakes);
          const speakers = createSpeakers();
          createEffect(
            () => speakers(),
            val => {
              if (val.length > 0) {
                expect(val).toEqual([deviceFakes[1]]);
                dispose();
                resolve();
              }
            },
          );
        }),
    ));

  it("initially reads all cameras", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" }),
          ];
          setDevices(deviceFakes);
          const cameras = createCameras();
          createEffect(
            () => cameras(),
            val => {
              if (val.length > 0) {
                expect(val).toEqual([deviceFakes[2]]);
                dispose();
                resolve();
              }
            },
          );
        }),
    ));

  it("reads updated devices", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const deviceFakes = [
            fakeDeviceInfo(),
            fakeDeviceInfo({ kind: "audiooutput" }),
            fakeDeviceInfo({ kind: "videoinput" }),
          ];
          setDevices(deviceFakes.slice(0, 1));
          const devices = createDevices();
          let initialized = false;
          createEffect(
            () => devices(),
            val => {
              if (!initialized && val.length > 0) {
                initialized = true;
                expect(val).toEqual(deviceFakes.slice(0, 1));
                setDevices(deviceFakes);
                (navigator.mediaDevices as any).dispatchFakeEvent();
              } else if (initialized && val.length === deviceFakes.length) {
                expect(val).toEqual(deviceFakes);
                dispose();
                resolve();
              }
            },
          );
        }),
    ));
});
