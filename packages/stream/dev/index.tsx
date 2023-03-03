import type { Component, JSX } from "solid-js";
import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";
import {
  createStream,
  createAmplitudeStream,
  createMediaPermissionRequest,
  createScreen,
} from "../src";
import "uno.css";

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      srcObject?: MediaStream;
    }
  }
}

export type E = JSX.Element;

const App: Component = () => {
  createMediaPermissionRequest();
  const [video] = createStream({ video: true });
  const [audioConstraints, setAudioConstraints] = createSignal<MediaStreamConstraints>();
  const [level] = createAmplitudeStream(audioConstraints);
  const [screenConstraints, setScreenConstraints] = createSignal<MediaStreamConstraints>();
  const [screen] = createScreen(screenConstraints);
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h2>TestVideo</h2>
        <video prop:srcObject={video()} autoplay />
        <h2>Amplitude test</h2>
        <Show
          when={audioConstraints()}
          fallback={
            <button
              onClick={() => setAudioConstraints({ audio: true })}
              title="We need user interaction to run an audio context"
            >
              Click to start amplitude level
            </button>
          }
        >
          <meter min="0" max="100" value={level()} />
        </Show>
        <h2>Screen Capture Test</h2>
        <video prop:srcObject={screen()} autoplay />
        <button
          onclick={() => setScreenConstraints({ video: true })}
          title="We need user interaction to capture screen"
        >
          {!screenConstraints() ? "Capture Screen" : "Change Window"}
        </button>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
