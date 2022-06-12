import { Component, For, createSignal } from "solid-js";
import { createAudio, AudioState } from "../src";
import { render } from "solid-js/web";
import { Icon } from "solid-heroicons";
import { play, pause, clock } from "solid-heroicons/solid";
import { volumeUp, exclamationCircle } from "solid-heroicons/outline";
import "uno.css";

const formatTime = time => new Date(time * 1000).toISOString().substr(14, 8);
const iconMap = {
  [AudioState.PLAYING]: pause,
  [AudioState.PAUSED]: play,
  [AudioState.STOPPED]: play,
  [AudioState.READY]: play,
  [AudioState.LOADING]: clock,
  [AudioState.ERROR]: exclamationCircle
};

const App: Component = () => {
  const [source, setSource] = createSignal("sample1.mp3");
  const [playing, setPlaying] = createSignal(false);
  const [playhead, setPlayhead] = createSignal(0);
  const [volume, setVolume] = createSignal(1);
  const audio = createAudio(source, playing, playhead, volume);
  return (
    <div class="flex justify-center items-center box-border w-full h-screen overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex justify-center shadow items-center bg-white rounded-full p-1 space-x-4">
          <button
            class="bg-transparent cursor-pointer flex border-none scale-200"
            disabled={audio.state == AudioState.ERROR}
            onClick={() => setPlaying(audio.state == AudioState.PLAYING ? false : true)}
          >
            <Icon
              class="w-12 text-blue-600 hover:text-blue-700 transition"
              path={iconMap[audio.state]}
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
            class="cursor-pointer transition hover:bg-gray-300 w-40 form-range rounded-3xl appearance-none bg-gray-200 focus:outline-none focus:ring-0 "
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
        <div class="flex justify-center bg-blue-500 rounded-b-xl bg">
          <For
            each={Object.entries({
              "Sample 1": "sample1.mp3",
              "Sample 2": "sample2.mp3",
              "Sample 3": "sample3.mp3"
            })}
          >
            {([label, url]) => (
              <button
                onClick={() => {
                  setSource(url);
                  setPlaying(false);
                }}
                class="transition cursor-pointer bg-transparent px-4 py-3 border-none"
                classList={{
                  "text-white hover:text-gray-900": url != source(),
                  "text-blue-800": url == source()
                }}
              >
                {label}
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
