import "./setup";
import { afterAll, describe, expect, it } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createStream, createAmplitudeStream, createMediaPermissionRequest } from "../src";

describe("createStream", () => {
  it("gets a stream", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const [stream] = createStream({ video: true });
          const expectations = [undefined, (window as any).__mockstream__];
          createEffect(() => {
            expect(stream()).toBe(expectations.shift());
            if (!expectations.length) {
              dispose();
              resolve();
            }
          });
        }),
    ));
});

describe("createAmplitudeStream", () => {
  it("gets an amplitude", () =>
    createRoot(
      dispose =>
        new Promise<void>(resolve => {
          const mockDevice: MediaDeviceInfo = {
            deviceId: "mock-device-id",
            groupId: "mock-group-id",
            label: "mock-device-label",
            kind: "audioinput",
            toJSON: function () {
              return JSON.stringify(this);
            },
          };
          const [amplitude] = createAmplitudeStream(mockDevice);
          createEffect(() => {
            if ((amplitude() || 0) > 0) {
              dispose();
              resolve();
            }
          });
        }),
    ));
});

describe("createMediaPermissionRequest", () => {
  const allConstraints: (MediaStreamConstraints | undefined)[] = [];
  const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
  navigator.mediaDevices.getUserMedia = constraints => {
    allConstraints.push(constraints);
    return originalGetUserMedia(constraints);
  };
  afterAll(() => {
    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  });
  it("requests a media stream", () => {
    createMediaPermissionRequest();
    expect(allConstraints.at(-1)).toEqual({ audio: true, video: true });
  });
});
