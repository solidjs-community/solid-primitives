import { Component, For, Show } from "solid-js";

import { createAccelerometer, createCameras, createMicrophones, createSpeakers } from "../src";
import { createPermission } from "../../permission";
import { createMediaPermissionRequest } from "../../stream";

const Cameras: Component = () => {
  const cameras = createCameras();
  return (
    <>
      <h3>Cameras</h3>
      <Show when={cameras().length > 0} fallback={<p>No cameras found</p>}>
        <ul>
          <For each={cameras()}>{camera => <li>{camera.label}</li>}</For>
        </ul>
      </Show>
    </>
  );
};

const AudioDevices: Component = () => {
  const microphones = createMicrophones();
  const speakers = createSpeakers();
  return (
    <>
      <h3>Microphones</h3>
      <Show when={microphones().length > 0} fallback={<p>No microphones found</p>}>
        <ul>
          <For each={microphones()}>{microphone => <li>{microphone.label}</li>}</For>
        </ul>
      </Show>
      <h3>Speakers</h3>
      <Show when={speakers().length > 0} fallback={<p>No speakers found</p>}>
        <ul>
          <For each={speakers()}>{speaker => <li>{speaker.label}</li>}</For>
        </ul>
      </Show>
    </>
  );
};

const App: Component = () => {
  createMediaPermissionRequest();
  const accel = createAccelerometer();
  const audioPermission = createPermission("microphone");
  const videoPermission = createPermission("camera");
  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h2>Accelerometer</h2>
        <p>
          <Show when={accel()} fallback={"not supported"} keyed>
            {accel => `x=${accel.x} y=${accel.y} z=${accel.z}`}
          </Show>
        </p>
        <h2>Devices</h2>
        <Show
          when={videoPermission() === "granted"}
          fallback={<p>Please grant camera permissions</p>}
        >
          <Cameras />
        </Show>
        <Show
          when={audioPermission() === "granted"}
          fallback={<p>Please grant microphone permissions</p>}
        >
          <AudioDevices />
        </Show>
      </div>
    </div>
  );
};

export default App;
