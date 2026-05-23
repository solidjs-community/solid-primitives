import "./setup";
import { afterAll, describe, expect, it } from "vitest";
import { createEffect, createRoot } from "solid-js";
import {
  createStream,
  createAmplitudeStream,
  createMediaPermissionRequest,
  createScreen,
} from "../src/index.js";

describe("createStream", () => {
  it("gets a stream", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const [stream] = createStream({ video: true });
        createEffect(
          () => stream(),
          value => {
            if (value === (window as any).__mockstream__) {
              dispose();
              resolve();
            }
          },
        );
      }),
    ));

  it("returns undefined before stream is acquired", () =>
    createRoot(dispose => {
      const [stream] = createStream({ video: true });
      expect(stream()).toBe(undefined);
      dispose();
    }));
});

describe("createAmplitudeStream", () => {
  it("gets an amplitude > 0", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
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
        createEffect(
          () => amplitude(),
          value => {
            if (value > 0) {
              dispose();
              resolve();
            }
          },
        );
      }),
    ));
});

describe("createScreen", () => {
  it("gets a screen stream", () =>
    new Promise<void>(resolve =>
      createRoot(dispose => {
        const [stream] = createScreen({ video: true });
        createEffect(
          () => stream(),
          value => {
            if (value === (window as any).__mockscreen__) {
              dispose();
              resolve();
            }
          },
        );
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

  it("requests both audio and video by default", () => {
    createMediaPermissionRequest();
    expect(allConstraints.at(-1)).toEqual({ audio: true, video: true });
  });

  it("requests only audio", () => {
    createMediaPermissionRequest("audio");
    expect(allConstraints.at(-1)).toEqual({ audio: true });
  });

  it("requests only video", () => {
    createMediaPermissionRequest("video");
    expect(allConstraints.at(-1)).toEqual({ video: true });
  });
});
