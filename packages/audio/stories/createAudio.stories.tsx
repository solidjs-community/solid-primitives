import { createSignal, For } from "solid-js";
import { Loading } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import { createAudio } from "@solid-primitives/audio";
import readme from "../README.md?raw";
import { SAMPLES, formatTime, VolumeSlider, SeekSlider } from "./_helpers.js";

const meta = preview.meta({
  title: "Display & Media/Audio",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const ReactivePlayer = meta.story({
  name: "Reactive player",
  parameters: {
    docs: {
      description: {
        story:
          "`createAudio` returns signals for `playing`, `volume`, `currentTime`, and `duration`. Switch tracks reactively — the source accessor reconnects the player automatically.",
      },
    },
  },
  render: () => {
    const [source, setSource] = createSignal(SAMPLES.at(0)!.url);
    const audio = createAudio(source);

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "320px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>createAudio</h3>

        <div style={{ display: "flex", gap: "0.5rem", "margin-bottom": "1rem" }}>
          <For each={SAMPLES}>
            {s => (
              <button
                onClick={() => setSource(s.url)}
                style={{
                  "font-weight": source() === s.url ? "bold" : "normal",
                  "text-decoration": source() === s.url ? "underline" : "none",
                }}
              >
                {s.label}
              </button>
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <button onClick={() => audio.setPlaying(!audio.playing())} style={{ "min-width": "70px" }}>
            {audio.playing() ? "⏸ Pause" : "▶ Play"}
          </button>

          <Loading fallback={<span style={{ color: "#94a3b8", "font-size": "0.85rem" }}>Loading…</span>}>
            <SeekSlider current={audio.currentTime} max={audio.duration()} onSeek={audio.seek} />
            <span style={{ "font-size": "0.85rem", "font-variant-numeric": "tabular-nums" }}>
              {formatTime(audio.currentTime())} / {formatTime(audio.duration())}
            </span>
          </Loading>
        </div>

        <VolumeSlider value={audio.volume} onChange={audio.setVolume} />
      </div>
    );
  },
});

export const ReactiveSource = meta.story({
  name: "Reactive source swap",
  parameters: {
    docs: {
      description: {
        story:
          "When the source signal changes, `createAudio` seamlessly reconnects the player. `duration` resets to pending and re-suspends `<Loading>` while the new track's metadata loads.",
      },
    },
  },
  render: () => {
    const [idx, setIdx] = createSignal(0);
    const source = () => SAMPLES.at(idx())!.url;
    const audio = createAudio(source);

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "320px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>Reactive source swap</h3>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "margin-bottom": "1rem" }}>
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx() === 0}>
            ← Prev
          </button>
          <strong>{SAMPLES.at(idx())?.label}</strong>
          <button
            onClick={() => setIdx(i => Math.min(SAMPLES.length - 1, i + 1))}
            disabled={idx() === SAMPLES.length - 1}
          >
            Next →
          </button>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <button onClick={() => audio.setPlaying(!audio.playing())} style={{ "min-width": "70px" }}>
            {audio.playing() ? "⏸ Pause" : "▶ Play"}
          </button>

          <Loading fallback={<span style={{ color: "#f59e0b", "font-size": "0.85rem" }}>⏳ Buffering…</span>}>
            <span style={{ "font-size": "0.85rem" }}>
              {formatTime(audio.currentTime())} / {formatTime(audio.duration())}
            </span>
          </Loading>
        </div>

        <VolumeSlider value={audio.volume} onChange={audio.setVolume} />
      </div>
    );
  },
});
