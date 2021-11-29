import "./setup";
import { createEffect, createRoot } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";
import { createDevices, createMicrophones, createSpeakers, createCameras } from "../src";

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

test("initially reads all devices", () =>
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
          assert.equal(devices(), expectedDevices.shift());
          if (expectedDevices.length === 0) {
            dispose();
            resolve();
          }
        });
      })
  ));

test("initially reads all microphones", () =>
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
          assert.equal(microphones(), expectedDevices.shift());
          if (expectedDevices.length === 0) {
            dispose();
            resolve();
          }
        });
      })
  ));

test("initially reads all speakers", () =>
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
          assert.equal(speakers(), expectedDevices.shift());
          if (expectedDevices.length === 0) {
            dispose();
            resolve();
          }
        });
      })
  ));

test("initially reads all cameras", () =>
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
          assert.equal(cameras(), expectedDevices.shift());
          if (expectedDevices.length === 0) {
            dispose();
            resolve();
          }
        });
      })
  ));

test("reads updated devices", () =>
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
          assert.equal(devices(), expectedDevices.shift());
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

test.run();
