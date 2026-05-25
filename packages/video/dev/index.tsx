import { type Component, createSignal } from "solid-js";
import { createVideoPlayer } from "../src/index.js";

const DEMO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const App: Component = () => {
  const [src, setSrc] = createSignal(DEMO_URL);
  const video = createVideoPlayer(src);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v space-y-4">
        <h4>Video Primitive Demo</h4>
        <video
          ref={el => {
            // sync the reactive player into the DOM element
            (video as any).player = el;
          }}
          src={src()}
          style={{ width: "640px", "max-width": "100%" }}
        />

        <div class="flex gap-2">
          <button class="btn" onClick={() => video.setPlaying(!video.playing())}>
            {video.playing() ? "Pause" : "Play"}
          </button>
          <button class="btn" onClick={() => video.setMuted(!video.muted())}>
            {video.muted() ? "Unmute" : "Mute"}
          </button>

        </div>

        <div class="space-y-1 text-sm">
          <p>
            Time: {video.currentTime().toFixed(1)}s — Ended: {String(video.ended())}
          </p>
          <p>
            Volume: {video.volume().toFixed(2)} — Muted: {String(video.muted())}
          </p>
          <p>
            Playback rate: {video.playbackRate()}x — Ready state: {video.readyState()}
          </p>
          <p>
            Dimensions: {video.videoWidth()} × {video.videoHeight()}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <label>Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={video.volume()}
            onInput={e => video.setVolume(Number((e.target as HTMLInputElement).value))}
          />
        </div>

        <div class="flex items-center gap-2">
          <label>Speed</label>
          <select
            value={video.playbackRate()}
            onChange={e => video.setPlaybackRate(Number((e.target as HTMLSelectElement).value))}
          >
            <option value="0.5">0.5×</option>
            <option value="1">1×</option>
            <option value="1.5">1.5×</option>
            <option value="2">2×</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default App;
