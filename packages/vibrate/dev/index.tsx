import { type Component, createSignal } from "solid-js";
import { createVibrate, isVibrationSupported } from "../src/index.js";

const App: Component = () => {
  const [pattern, setPattern] = createSignal<number | number[]>([200, 100, 200]);
  const { vibrating, start, stop, supported } = createVibrate(pattern);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v">
        <h4>Vibration</h4>
        <p class="caption">
          {supported ? "Vibration API supported" : "Vibration API not supported in this browser"}
        </p>
        <p>
          <strong>Status:</strong> {vibrating() ? "Vibrating" : "Idle"}
        </p>
        <div class="flex gap-4">
          <button class="btn" onClick={start} disabled={!supported}>
            Start
          </button>
          <button class="btn" onClick={stop} disabled={!supported}>
            Stop
          </button>
        </div>
        <p class="caption">
          Supported: {String(isVibrationSupported())}
        </p>
      </div>
    </div>
  );
};

export default App;
