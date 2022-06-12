import { Component, Show, createSignal } from "solid-js";
import { createAudio, AudioState } from "../src";
import { render } from "solid-js/web";
import { Icon } from "solid-heroicons";
import { play, pause } from "solid-heroicons/solid";
import { volumeUp } from "solid-heroicons/outline";
import "uno.css";

const formatTime = time => new Date(time * 1000).toISOString().substr(14, 8);

const App: Component = () => {
  const [playing, setPlaying] = createSignal(false);
  const [playhead, setPlayhead] = createSignal(0);
  const [volume, setVolume] = createSignal(1);
  const audio = createAudio("sample.mp3", playing, playhead, volume);
  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex justify-center items-center bg-white rounded-full p-1 space-x-3">
        <button
          class="bg-transparent flex border-none"
          disabled={audio.state == AudioState.ERROR}
          onClick={() => setPlaying(audio.state == AudioState.PLAYING ? false : true)}
        >
          <Icon
            class="w-12 text-blue-600"
            path={audio.state == AudioState.PLAYING ? pause : play}
          />
        </button>
        <div>
          {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
        </div>
        <input
          onInput={evt => setPlayhead(evt.currentTarget.value)}
          type="range"
          min="0"
          step="0.1"
          max={audio.duration}
          value={audio.currentTime}
          class="cursor w-40 form-range rounded-xl appearance-none bg-gray-200 focus:outline-none focus:ring-0 "
        />
        <div class="flex px-2">
          <Icon class="w-6 text-blue-600" path={volumeUp} />
          <input
            onInput={evt => setVolume(evt.currentTarget.value)}
            type="range"
            min="0"
            step="0.1"
            max={1}
            value={volume()}
            class="cursor w-10"
          />
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
