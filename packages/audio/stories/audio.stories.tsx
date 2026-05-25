import { createSignal, For, Show } from "solid-js";
import { Loading } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import { createAudio, makeAudio, makeAudioPlayer } from "@solid-primitives/audio";
import readme from "../README.md?raw";

// Audio files are served from packages/audio/dev/ via storybook staticDirs → /audio/*
const SAMPLES = [
  { label: "Sample 1", url: "/audio/sample1.mp3" },
  { label: "Sample 2", url: "/audio/sample2.mp3" },
  { label: "Sample 3", url: "/audio/sample3.mp3" },
] as const;

// ---------------------------------------------------------------------------
// Small shared UI helpers
// ---------------------------------------------------------------------------

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const VolumeSlider = (props: { value: () => number; onChange: (v: number) => void }) => (
  <label style={{ display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "0.85rem" }}>
    Vol
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={props.value()}
      onInput={e => props.onChange(+e.currentTarget.value)}
      style={{ width: "80px" }}
    />
    <span>{Math.round(props.value() * 100)}%</span>
  </label>
);

const SeekSlider = (props: {
  current: () => number;
  max: number;
  onSeek: (t: number) => void;
}) => (
  <input
    type="range"
    min="0"
    max={props.max}
    step="0.5"
    value={props.current()}
    onInput={e => props.onSeek(+e.currentTarget.value)}
    style={{ width: "180px" }}
  />
);

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Reactive = meta.story({
  name: "createAudio — reactive player",
  parameters: {
    docs: {
      description: {
        story:
          "`createAudio` returns signals for `playing`, `volume`, `currentTime`, and `duration`. Switch tracks reactively — the source accessor reconnects the player automatically.",
      },
    },
  },
  render: () => {
    const [source, setSource] = createSignal<string>(SAMPLES[0].url);
    const audio = createAudio(source);

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "320px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>createAudio</h3>

        {/* Track selector */}
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

        {/* Play / Pause */}
        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <button onClick={() => audio.setPlaying(!audio.playing())} style={{ "min-width": "70px" }}>
            {audio.playing() ? "⏸ Pause" : "▶ Play"}
          </button>

          <Loading fallback={<span style={{ color: "#94a3b8", "font-size": "0.85rem" }}>Loading…</span>}>
            <SeekSlider
              current={audio.currentTime}
              max={audio.duration()}
              onSeek={audio.seek}
            />
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
  name: "createAudio — reactive source",
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
    const source = () => SAMPLES[idx()]!.url;
    const audio = createAudio(source);

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "320px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>Reactive source swap</h3>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center", "margin-bottom": "1rem" }}>
          <button
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx() === 0}
          >
            ← Prev
          </button>
          <strong>{SAMPLES[idx()]?.label}</strong>
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

export const NonReactive = meta.story({
  name: "makeAudio — non-reactive",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAudio` creates a raw `HTMLAudioElement` with event handlers attached. No Solid owner required — you manage lifecycle yourself via the returned `cleanup` function.",
      },
    },
  },
  render: () => {
    const [playing, setPlaying] = createSignal(false);
    const [volume, setVol] = createSignal(1);

    const [player, cleanup] = makeAudio("/audio/sample1.mp3", {
      playing: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      volumechange: () => setVol(player.volume),
    });

    // cleanup is called when the story owner disposes
    // (storybook-solidjs-vite handles the root lifecycle)

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "280px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>makeAudio</h3>
        <p style={{ "font-size": "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
          Direct <code>HTMLAudioElement</code> — no reactive signals.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <button
            onClick={() => {
              playing() ? player.pause() : player.play();
            }}
            style={{ "min-width": "70px" }}
          >
            {playing() ? "⏸ Pause" : "▶ Play"}
          </button>
          <button onClick={cleanup}>■ Cleanup</button>
        </div>

        <VolumeSlider
          value={volume}
          onChange={v => {
            player.volume = v;
          }}
        />
      </div>
    );
  },
});

export const PlayerControls = meta.story({
  name: "makeAudioPlayer — controls",
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

          <Show when={duration() > 0} fallback={<span style={{ "font-size": "0.85rem", color: "#94a3b8" }}>Loading…</span>}>
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
