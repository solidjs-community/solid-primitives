import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeAudioPlayer } from "@solid-primitives/audio";
import { formatTime, VolumeSlider, SeekSlider } from "./_helpers.js";

const meta = preview.meta({
  title: "Display & Media/Audio",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const Controls = meta.story({
  name: "Player controls",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAudioPlayer` wraps `makeAudio` with a `controls` object exposing `play`, `pause`, `seek`, and `setVolume` methods. Still non-reactive — useful when you want imperative control without signals.",
      },
    },
  },
  render: () => {
    const [playing, setPlaying] = createSignal(false);
    const [currentTime, setCurrentTime] = createSignal(0);
    const [duration, setDuration] = createSignal(0);
    const [volume, setVolume] = createSignal(1);

    const [controls] = makeAudioPlayer("/audio/sample2.mp3", {
      playing: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      timeupdate: () => setCurrentTime(controls.player.currentTime),
      loadeddata: () => setDuration(controls.player.duration),
      volumechange: () => setVolume(controls.player.volume),
    });

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "320px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>makeAudioPlayer</h3>

        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <button
            onClick={() => (playing() ? controls.pause() : controls.play())}
            style={{ "min-width": "70px" }}
          >
            {playing() ? "⏸ Pause" : "▶ Play"}
          </button>

          <Show
            when={duration() > 0}
            fallback={<span style={{ "font-size": "0.85rem", color: "#94a3b8" }}>Loading…</span>}
          >
            <SeekSlider current={currentTime} max={duration()} onSeek={controls.seek} />
            <span style={{ "font-size": "0.85rem", "font-variant-numeric": "tabular-nums" }}>
              {formatTime(currentTime())} / {formatTime(duration())}
            </span>
          </Show>
        </div>

        <VolumeSlider value={volume} onChange={controls.setVolume} />
      </div>
    );
  },
});
