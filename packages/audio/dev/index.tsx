import { Component, Show, createSignal } from "solid-js";
import { createAudio, AudioState } from "../src";
import { render } from "solid-js/web";
import "uno.css";

const App: Component = () => {
  const [playing, setPlaying] = createSignal(false);
  const [playhead, setPlayhead] = createSignal(0);
  const [volume, setVolume] = createSignal(1);
  const audio = createAudio("sample.mp3", playing, playhead, volume);
  return (
    <div class="box-border w-full h-screen overflow-hidden bg-gray-900 text-white">
      <button
        disabled={audio.state == AudioState.ERROR}
        onClick={() => setPlaying(audio.state == AudioState.PLAYING ? false : true)}
      >
        <Show fallback="Play" when={audio.state == AudioState.PLAYING}>
          Pause
        </Show>
      </button>
      <tbody>
        <table>
          <tr>
            <td>Duration:</td>
            <td>{audio.duration}</td>
          </tr>
          <tr>
            <td>Time:</td>
            <td>{audio.currentTime}</td>
          </tr>
          <tr>
            <td>State:</td>
            <td>{audio.state}</td>
          </tr>
          <tr>
            <td>Volume:</td>
            <td>{volume() * 100}</td>
          </tr>
        </table>
      </tbody>
    </div>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
