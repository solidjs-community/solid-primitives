import { Component, For, Show, createSignal } from "solid-js";
import { createAudio, AudioState } from "../src";

import { Icon } from "solid-heroicons";
import { play, pause } from "solid-heroicons/solid";
import { speakerWave } from "solid-heroicons/outline";

const formatTime = (time: number) => new Date(time * 1000).toISOString().substr(14, 8);

const App: Component = () => {
  const [source, setSource] = createSignal("sample1.mp3");
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(source, playing, volume);
  return (
    <div class="box-border flex h-screen w-full items-center justify-center overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex items-center justify-center space-x-4 rounded-full bg-white p-1 shadow">
          <button
            class="scale-200 flex cursor-pointer border-none bg-transparent"
            disabled={audio.state == AudioState.ERROR}
            onClick={() => setPlaying(audio.state == AudioState.PLAYING ? false : true)}
          >
            <Icon
              class="w-12 text-blue-600 transition hover:text-blue-700"
              path={audio.state === AudioState.PLAYING ? pause : play}
            />
          </button>
          <div class="min-w-32 text-center">
            <Show fallback="Loading..." when={audio.state !== AudioState.LOADING}>
              {formatTime(audio.currentTime)} / {formatTime(audio.duration)}
            </Show>
          </div>
          <input
            onInput={evt => seek(+evt.currentTarget.value)}
            type="range"
            min="0"
            step="0.1"
            max={audio.duration}
            value={audio.currentTime}
            class="form-range w-40 cursor-pointer appearance-none rounded-3xl bg-gray-200 transition hover:bg-gray-300 focus:outline-none focus:ring-0 "
          />
          <div class="flex px-2">
            <Icon class="w-6 text-blue-600" path={speakerWave} />
            <input
              onInput={evt => setVolume(+evt.currentTarget.value)}
              type="range"
              min="0"
              step="0.1"
              max={1}
              value={volume()}
              class="cursor w-10"
            />
          </div>
        </div>
        <div class="bg flex justify-center rounded-b-xl bg-blue-500">
          <For
            each={Object.entries({
              "Sample 1": "sample1.mp3",
              "Sample 2": "sample2.mp3",
              "Sample 3": "sample3.mp3",
            })}
          >
            {([label, url]) => (
              <button
                onClick={() => {
                  setSource(url);
                }}
                class="cursor-pointer border-none bg-transparent px-4 py-3 transition"
                classList={{
                  "text-white hover:text-gray-900": url != source(),
                  "text-blue-800": url == source(),
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

export default App;
