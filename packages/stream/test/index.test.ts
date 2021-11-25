import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { createEffect, createRoot } from "solid-js";
import { createStream, createAmplitudeStream, createMediaPermissionRequest } from "../src";

const testCreateStream = suite("createStream");

testCreateStream("gets a stream", () =>
  createRoot(
    dispose =>
      new Promise<void>(resolve => {
        const [stream] = createStream({ video: true });
        const expectations = [undefined, (window as any).__mockstream__];
        createEffect(() => {
          assert.is(stream(), expectations.shift());
          if (!expectations.length) {
            dispose();
            resolve();
          }
        });
      })
  ));

testCreateStream.run();

const testCreateAmplitudeStream = suite("createAmplitudeStream");

testCreateAmplitudeStream("gets an amplitude", () =>
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

testCreateAmplitudeStream.run();

const testCreateMediaPermissionRequest = suite("createMediaPermissionRequest");

testCreateMediaPermissionRequest.before((context) => {
  context.constraints = [];
  context.originalGetUserMedia = navigator.mediaDevices.getUserMedia;
  navigator.mediaDevices.getUserMedia = (constraints) => {
    context.constraints.push(constraints);
    return context.originalGetUserMedia(constraints);
  };
});

testCreateMediaPermissionRequest.after((context) => {
  navigator.mediaDevices.getUserMedia = context.originalGetUserMedia;
});

testCreateMediaPermissionRequest("requests a media stream", (context) => {
  createMediaPermissionRequest();
  assert.equal(context.constraints, [{ audio: true, video: true }]);
});

testCreateMediaPermissionRequest.run();
