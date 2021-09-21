import { createEffect, createRoot } from "solid-js";
import { createStream, createAmplitudeStream, createMediaPermissionRequest } from "../src";

describe("createStream", () => {
  test("gets a stream", () =>
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
        })
    ));
});

describe("createAmplitudeStream", () => {
  test("gets an amplitude", () =>
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
            }
          };
          const [amplitude] = createAmplitudeStream(mockDevice);
          createEffect(() => {
            if (amplitude() > 0) {
              dispose();
              resolve();
            }
          });
        })
    ));
});

describe("createMediaPermissionRequest", () => {
  const requestSpy = jest.spyOn(navigator.mediaDevices, "getUserMedia");
  test("requests a media stream", () => {
    createMediaPermissionRequest();
    expect(requestSpy).toHaveBeenCalledWith({ audio: true, video: true });
  });
});
