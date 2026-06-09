import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createVideo, createVideoPlayer } from "@solid-primitives/video";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  BoolRow,
  StatRow,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Video",
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

const VIDEO = "/video/big_buck_bunny_sall.mp4";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// duration() throws NotReadyError until metadata loads. Storybook's React-hosted
// docs page intercepts that throw before Solid's <Loading> boundary can catch it,
// crashing the story. Try-catch here keeps the error contained in solid's reactive
// graph so Show can gate on readiness instead.
const safeDur = (dur: () => number): number | undefined => {
  try { return dur(); } catch { return undefined; }
};

const SPEEDS = [0.5, 1, 1.5, 2] as const;

export const PlaySeek = meta.story({
  name: "Play & seek",
  parameters: {
    docs: {
      description: {
        story:
          "`createVideo` tracks `playing`, `currentTime`, `ended`, and `seeking` reactively. `duration` throws `NotReadyError` until metadata loads — use it with `<Loading>` or a guarded accessor.",
      },
    },
  },
  render: () => {
    const video = createVideo(VIDEO, { preload: "metadata", muted: true });
    const dur = () => safeDur(video.duration);

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Show
            when={dur() !== undefined}
            fallback={
              <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>
            }
          >
            <input
              type="range"
              min="0"
              max={dur()!}
              value={video.currentTime()}
              onInput={e => video.seek(Number(e.currentTarget.value))}
              style={{ flex: "1", "min-width": "0" }}
            />
            <span
              style={{
                "font-size": font.sizeSm,
                "font-family": font.mono,
                "white-space": "nowrap",
              }}
            >
              {fmt(video.currentTime())} / {fmt(dur()!)}
            </span>
          </Show>
        </div>

        <Section title="State">
          <BoolRow label="playing" value={video.playing()} />
          <BoolRow label="ended" value={video.ended()} />
          <BoolRow label="seeking" value={video.seeking()} />
        </Section>
      </Container>
    );
  },
});

export const FullControls = meta.story({
  name: "Full control surface",
  parameters: {
    docs: {
      description: {
        story:
          "`createVideoPlayer` exposes the full control surface: seek, `volume`, `muted`, `playbackRate`, and `loop`. All signals update reactively as you interact.",
      },
    },
  },
  render: () => {
    const video = createVideoPlayer(VIDEO, { preload: "metadata", muted: true });
    const dur = () => safeDur(video.duration);

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <ButtonRow>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Button
            onClick={() => video.setLoop(!video.loop())}
            variant={video.loop() ? "primary" : "outline"}
          >
            ↺ Loop
          </Button>
        </ButtonRow>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Show
            when={dur() !== undefined}
            fallback={<span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>}
          >
            <input
              type="range"
              min="0"
              max={dur()!}
              value={video.currentTime()}
              onInput={e => video.seek(Number(e.currentTarget.value))}
              style={{ flex: "1", "min-width": "0" }}
            />
            <span style={{ "font-size": font.sizeSm, "font-family": font.mono, "white-space": "nowrap" }}>
              {fmt(video.currentTime())} / {fmt(dur()!)}
            </span>
          </Show>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Button
            onClick={() => video.setMuted(!video.muted())}
            variant={video.muted() ? "primary" : "outline"}
            style={{ "white-space": "nowrap" }}
          >
            {video.muted() ? "🔇 Muted" : "🔊 Sound"}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={video.volume()}
            onInput={e => video.setVolume(Number(e.currentTarget.value))}
            disabled={video.muted()}
            style={{ flex: "1" }}
          />
          <span style={{ "font-size": font.sizeSm, "font-family": font.mono, "white-space": "nowrap" }}>
            {(video.volume() * 100).toFixed(0)}%
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Speed</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <For each={SPEEDS}>
              {s => (
                <Button
                  onClick={() => video.setPlaybackRate(s)}
                  variant={video.playbackRate() === s ? "primary" : "outline"}
                  style={{ padding: "0.35rem 0.65rem" }}
                >
                  {s}×
                </Button>
              )}
            </For>
          </div>
        </div>

        <Section title="State">
          <BoolRow label="playing" value={video.playing()} />
          <StatRow label="volume" value={`${(video.volume() * 100).toFixed(0)}%`} />
          <BoolRow label="muted" value={video.muted()} />
          <StatRow label="playbackRate" value={`${video.playbackRate()}×`} />
          <BoolRow label="loop" value={video.loop()} />
        </Section>
      </Container>
    );
  },
});

const CLIPS = [
  { label: "Clip A", url: VIDEO },
  { label: "Clip B", url: `${VIDEO}?2` },
];

export const ReactiveSource = meta.story({
  name: "Reactive source",
  parameters: {
    docs: {
      description: {
        story:
          "Pass an accessor as `src` — when the signal changes, `createVideo` reconnects the player and resets `duration` to pending. Both clips use the same file; the distinct URL triggers the reactive reconnect.",
      },
    },
  },
  render: () => {
    const [idx, setIdx] = createSignal(0);
    const video = createVideo(() => CLIPS[idx()]!.url, { preload: "metadata", muted: true });
    const dur = () => safeDur(video.duration);

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <ButtonRow>
          <For each={CLIPS}>
            {(c, i) => (
              <Button
                onClick={() => setIdx(i())}
                variant={idx() === i() ? "primary" : "outline"}
              >
                {c.label}
              </Button>
            )}
          </For>
        </ButtonRow>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Show
            when={dur() !== undefined}
            fallback={
              <span style={{ color: colors.warning, "font-size": font.sizeSm }}>
                ⏳ Loading…
              </span>
            }
          >
            <span style={{ "font-size": font.sizeSm, "font-family": font.mono }}>
              {fmt(video.currentTime())} / {fmt(dur()!)}
            </span>
          </Show>
        </div>
      </Container>
    );
  },
});
